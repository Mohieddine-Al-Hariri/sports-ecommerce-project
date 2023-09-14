"use client";
import { addItemToCart, publishCart, publishItemAddedToCart, publishManyVariants } from "@/lib";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import the carousel styles
import { ImagesCarouselModal, ProductCard, ScrollButton } from ".";
import ReactStars from "react-rating-star-with-type";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { useIsVisible } from "./UseVisible";

export function Variants({
  variant,
  setChosenProductVariantName,
  isChosen,
  isOutOfStock,
}) {
  let isDisabled = false;
  let bg = "bg-neutral-100";
  let txtClr = "text-neutral-700";
  if (isOutOfStock || variant?.quantity === 0) {
    isDisabled = true;
    bg = "bg-gray-100";
    txtClr = "text-gray-300";
  } else if (isChosen) {
    bg = "bg-zinc-800";
    txtClr = "text-white";
    isChosen = true;
  }

  let quantity = variant?.quantity;
  if (variant?.quantity === null) quantity = "♾️"; //no limit

  return (
    <button
      disabled={isDisabled}
      onClick={() => setChosenProductVariantName(variant.name)}
      className={` ${bg} ${txtClr} w-fit h-fit p-2 flex-col justify-start items-start inline-flex rounded-full `}
    >
      <div className="text-sm font-bold leading-normal">
        {variant.name}
        {isChosen && (
          <span className="border-b-2 border-gray-300 ml-1">{quantity}</span>
        )}
      </div>
    </button>
  );
}
export function ReviewCard({ review }) {
  return (
    <div className="flex flex-col py-2 px-4 gap-2 mb-2 ">
      <div className="flex items-center gap-2 ">
        <Image
          src={review.theUser.profileImageUrl}
          alt={review.theUser.firstName}
          width={50}
          height={50}
          className="rounded-full"
        />
        <h2>
          {review.theUser.firstName} {review.theUser.lastName}
        </h2>
        <ReactStars
          count={5}
          value={review.rating}
          size={16}
          isHalf={true}
          activeColors={["red", "orange", "#FFCE00", "#FFCE00", "#4bc0d9"]}
        />
      </div>
      <h1 className="font-bold ">{review.headline}</h1>
      <p className="">{review.content}</p>
      <div className="w-3/4 h-1 bgColorGray "></div>
    </div>
  );
}

const ItemsDetailsPage = ({ product, user }) => {
  const [chosenProductVariantName, setChosenProductVariantName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [quantityLimit, setQuantityLimit] = useState(null);
  const [isItemAddedToCart, setIsItemAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoggedin, setisLoggedin] = useState(false);
  const [showPleaseLogin, setShowPleaseLogin] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [selectVariantError, setSelectVariantError] = useState(false);
  const [isReachedLimit, setIsReachedLimit] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const detailsRef = useRef(null);
  const isLastOrderCardVisible = useIsVisible(detailsRef);


  const [showFullDescription, setShowFullDescription] = useState(false);
  const maxDescriptionWords = 5;
  const descriptionToShow = showFullDescription
    ? product.description.replace(/\n/g, "  \n") || ""
    : product.description.split(" ").slice(0, maxDescriptionWords).join(" ");

  const showMoreLessLabel = showFullDescription ? "Show Less" : "Show More";
  function checkOutOfStock() {
    let outOfStock = true;
    if (product.productVariants.length > 0){
      for (const variant of product.productVariants) {
        if (variant.quantity > 0 || variant.quantity === null) {
          outOfStock = false;
          break;
        }
      }
    } else outOfStock = false;
    if (product.state !== "Available") outOfStock = true;
    return outOfStock;
  }

  const router = useRouter();

  useEffect(() => {
    setIsOutOfStock(checkOutOfStock());
    if (user) setisLoggedin(true);
  }, []);
  useEffect(() => {
    const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
    if (isDarkModeLocal) {
      document.body.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.body.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    let limit = null;
    product.productVariants.map((variant) => {
      if (variant.name === chosenProductVariantName) limit = variant.quantity;
    });
    setQuantityLimit(limit);
    if (limit && quantity > limit) {
      setQuantity(limit);
      setIsReachedLimit(true);
      setTimeout(function () {
        setIsReachedLimit(false);
      }, 2000);
    }
  }, [chosenProductVariantName]);

  const handleToggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };
  // Use a useEffect hook to add/remove event listeners for touch devices
  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.msMaxTouchPoints;
    const handleToggleTooltip = document.getElementById("tooltip");
    if (isTouchDevice) {
      // On touch devices, add a click event listener to show the tooltip once
      handleToggleTooltip.addEventListener("click", handleToggleTooltip, {
        once: true,
      });
    }

    // Clean up the event listener when the component unmounts
    return () => {
      if (isTouchDevice) {
        handleToggleTooltip.removeEventListener("click", handleToggleTooltip);
      }
    };
  }, []);

  const itemToCart = async () => {
    // if(!isLoggedin){
    // setShowPleaseLogin(true);
    // setTimeout(function(){
    //   setShowPleaseLogin(false);
    // }, 2000);
    //   return;
    // }
    if (product.state !== "Available") return;
    setIsAdding(true);
    const totalPrice = quantity * product.price;
    let chosenProductVariant = "";
    if (product.productVariants.length === 0)
      setChosenProductVariantName(product.name);
    else if (product.productVariants.length === 1) {
      chosenProductVariant = product.productVariants[0].name;
      setChosenProductVariantName(product.productVariants[0].name);
    } else {
      if (!chosenProductVariantName) {
        //To make sure a variant is chosen
        //Add an error that the user needs to choose a variant...
        //Or, change this to chose the first (available) variant automatically
        // chosenProductVariant = product.productVariants[0]?.name;
        // setChosenProductVariantName(product.productVariants[0]?.name);
        setSelectVariantError(true);
        setTimeout(function () {
          setSelectVariantError(false);
        }, 3000);
        setIsAdding(false);
        return;
      } else chosenProductVariant = chosenProductVariantName;
    }
    if (!isLoggedin) {
      const localCart = JSON.parse(localStorage.getItem("cart"));
      const id = uuidv4();
      const cartItem = {
        id,
        quantity,
        total: totalPrice,
        chosenProductsVariants: [chosenProductVariant],
        product: {
          imageUrls: [{ url: product.imageUrls[0].url }],
          name: product.name,
          price: product.excerpt,
          id: product.id
        }
      }
      const updatedCart = localCart
        ? [...localCart, cartItem ]
        : [cartItem];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setIsAdding(false);
      setIsAddedToCart(true);
      setIsItemAddedToCart(true);
      setTimeout(function () {
        setIsItemAddedToCart(false);
      }, 2000);
      return
    }
    //if user logged in, do this⬇️⬇️
    const cartId = user.cartId;
    const isAdded = await addItemToCart({
      itemId: product.id,
      userSlug: user.slug,
      quantity,
      totalPrice,
      cartId,
      chosenProductsVariants: [chosenProductVariant],
    });
    const publishCartPromise = publishCart(cartId); //Needs publish after being updated
    const publishItemPromise = publishItemAddedToCart(
      isAdded.updateCart.orderItems[isAdded.updateCart.orderItems.length - 1].id
    );
    const publishVariantsPromise = publishManyVariants(isAdded.updateCart.orderItems[isAdded.updateCart.orderItems.length - 1].id);
    await Promise.all([publishCartPromise, publishItemPromise, publishVariantsPromise])
    setIsAdding(false);
    setIsAddedToCart(true);
    setIsItemAddedToCart(true);
    router.refresh();
    setTimeout(function () {
      setIsItemAddedToCart(false);
    }, 2000);
  };

  const increaseQuantity = () => {
    if (quantityLimit !== null && quantity + 1 > quantityLimit) {
      setIsReachedLimit(true);
      setQuantity(quantityLimit);
      setTimeout(function () {
        setIsReachedLimit(false);
      }, 2000);
      return;
    }
    setQuantity((quantity) => quantity + 1);
  };

  const scrollToBottom = () => {
    detailsRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const rates = product.reviews?.map((review) => review.rating);
  const rate = rates?.reduce((a, b) => a + b, 0) / rates?.length;
  return (
    <div className=" overflow-y-scroll h-screen overflow-x-hidden flex items-start justify-center px-2 pb-10 bgColor  ">
      <div className="max-sm:w-[428px] w-full max-sm:pb-6 relative bgColor fontColor max-sm:flex-col gap-6 justify-start flex-wrap items-start max-sm:inline-flex">
        <div className="sm:flex sm:items-start sm:mb-10 sm:justify-center w-full ">
          {/* TODO: Make the image size based on the used images dimensions */}
          <ImagesCarouselModal product={product} setImageIndex={setCurrentImageIndex} />
          <div className="flex flex-col gap-10 sm:h-full">
            <div className="max-sm:w-full w-[440px] relative bgColor flex flex-col justify-center px-2 pl-5 gap-4">
              <div>
                <div className="left-[30px] top-[22px] text-xl font-bold mb-1">
                  {product.name}
                </div>
                <div className="left-[31px] top-[54px] text-sm font-thin leading-[18px]">
                  {product.excerpt || "Winter Training Full-Zip Hoodie"}
                </div>
                <div className="left-[31px] top-[54px] fontColor text-sm leading-[18px]">
                  <ReactMarkdown className="prose mt-2">
                    {descriptionToShow}
                  </ReactMarkdown>
                  {product.description &&
                    product.description.split(" ").length >
                      maxDescriptionWords && (
                      <span
                        className="cursor-pointer text-blue-500"
                        onClick={() =>
                          setShowFullDescription(!showFullDescription)
                        }
                      >
                        {" "}
                        {showMoreLessLabel}
                      </span>
                    )}
                </div>
              </div>
              <div>
                {product.productVariants.length > 0 && (
                  <div className="left-[31px] top-[88px] text-sm font-bold leading-tight mb-2">
                    Variants
                  </div>
                )}
                <div className="max-sm:w-screen h-fit left-[30px] top-[122px] flex flex-wrap gap-2">
                  {product.productVariants.map((variant, index) => {
                    let isChosen = chosenProductVariantName === variant.name;
                    return (
                      <Variants
                        variant={variant}
                        key={index}
                        setChosenProductVariantName={
                          setChosenProductVariantName
                        }
                        isChosen={isChosen}
                        isOutOfStock={isOutOfStock}
                      />
                    );
                  })}
                </div>
              </div>
              <h1
                className={`text-xl ${
                  isOutOfStock ? "text-red-500" : "text-green-500"
                } `}
              >
                {isOutOfStock ? "Out of Stock!" : "Available"}
              </h1>
              <div className="relative w-full flex flex-col justify-start sm:justify-between item-center text-black ">
                <div className="w-3/4 flex justify-between item-center">
                  <div
                    className={`${
                      isDarkMode ? "bg-neutral-700" : "bg-neutral-100"
                    } rounded-full flex justify-between items-center gap-3 fontColor`}
                  >
                    <button
                      onClick={() => {
                        if (quantity > 1 && product.state === "Available")
                          setQuantity(quantity - 1);
                      }}
                      className="rounded-full bgColor w-10 h-10 p-2 text-4xl flex justify-center items-center"
                    >
                      -
                    </button>
                    <h3 className="text-2xl">{quantity}</h3>
                    <button
                      onClick={increaseQuantity}
                      className="rounded-full bgColor w-10 h-10 p-2 text-4xl flex justify-center items-center"
                    >
                      +
                    </button>
                  </div>
                  <div>
                    <div className=" fontColor text-xs font-thin leading-[14px]">
                      Price
                    </div>
                    <div className="fontColor text-2xl font-semibold leading-7">
                      {/* ${product.price} */}
                      {product.isOnSale ? 
                        <div className="flex gap-2 ">
                          <div className="relative flex items-end ">
                            ${product.previousPrice}
                            <span className="absolute right-0 transform -translate-x-1/2 rotate-12 -bottom-2 text-2xl text-red-500 ">/</span>
                          </div>
                          <h1 className="font-bold">${product.price}</h1>
                        </div> 
                      : product.price}
                      
                    </div>
                  </div>
                </div>
                {isReachedLimit && (
                  <h1 className="text-red-500 mt-1 absolute -bottom-7">
                    Chosen Variant Quantity limit reached
                  </h1>
                )}
              </div>
              <div
                id="tooltip"
                className="relative"
                onMouseEnter={handleToggleTooltip}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {product.reviews && product.reviews.length > 0 && (
                  <ReactStars
                    count={5}
                    value={rate}
                    size={16}
                    isHalf={true}
                    activeColors={[
                      "red",
                      "orange",
                      "#FFCE00",
                      "#FFCE00",
                      "#4bc0d9",
                    ]}
                    className="absolute bottom-0 right-0"
                  />
                )}
                {showTooltip && (
                  <div className="tooltip">based on the last 10 reviews</div>
                )}
              </div>
            </div>
            {/* <div className="w-full text-center text-black text-3xl flex justify-center gap-3"> Total <h1 className="font-bold"> {product.price*quantity}</h1>  </div> */}
            <div className="w-full flex justify-center items-center flex-col pb-8 ">
              <div className=" w-full flex justify-center bgColor pb-4">
                <button
                  ref={detailsRef} 
                  disabled={isOutOfStock}
                  onClick={itemToCart}
                  className={`h-[60px] pl-[86px] pr-[89px] pt-[18px] pb-[17px] ${
                    product.state !== "Available" ? "bg-gray-300" : "opBgColor"
                  } rounded-full justify-center items-start gap-[15px] inline-flex`}
                >
                  <div className="opTxtColor text-xl font-bold leading-normal">
                    {isAdding ? (
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
                      "Add to cart"
                    )}
                  </div>
                </button>
              </div>
              {isAddedToCart && (
                <div className="flex gap-2 ">
                  <Link href="/" className="underline ">
                    Continue Shopping
                  </Link>
                  Or
                  <Link href={`/Cart/${user?.slug}`} className="underline ">
                    Checkout
                  </Link>
                </div>
              )}
              {/* {showPleaseLogin && (
                <p className="text-red-500 text-center ">
                  To add item to cart, please Sign in
                </p>
              )} */}
              {selectVariantError && (
                <p className="text-[#4bc0d9] text-center ">
                  Please Select Your Desired Variant
                </p>
              )}
              {isItemAddedToCart && (
                <p className="text-green-500 text-center ">
                  Item Added Successfuly
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Similars from same Category */}
        {product.categories[0]?.products > 0 && (
          <h2 className="pl-4 ">Other Related Products</h2>
        )}
        {product.categories[0]?.products > 0 && (
          <div className=" flex gap-3 items-center justify-start mb-10 pb-2 px-4 relative overflow-x-scroll  ">
            {product.categories[0]?.products?.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                excerpt={product.excerpt}
                imageUrl={product.imageUrls[0].url}
              />
            ))}
          </div>
        )}
        {product.reviews.length > 0 && (
          <div className="w-full h-1 bgColorGray "></div>
        )}
        {product.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      <ScrollButton rotationDegree={180} isObservedElementVisible={isLastOrderCardVisible} handleClick={scrollToBottom} />
    </div>
  );
};

export default ItemsDetailsPage;
