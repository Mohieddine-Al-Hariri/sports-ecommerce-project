"use client";
import { addItemToCart, publishCart, publishItemAddedToCart } from "@/lib";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import the carousel styles
// import { ProductCard } from ".";
import ReactStars from "react-rating-star-with-type";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useIsVisible } from "./UseVisible";

export function Variants({
  variant,
  setChosenProductsVariantsNames,
  isChosen,
  isOutOfStock,
  currentImageIndex,
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
      onClick={() =>
        setChosenProductsVariantsNames(currentImageIndex, variant.name)
      }
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
export const AddItemForm = ({
  isDarkMode,
  isOutOfStock,
  currentImageIndex,
  collection,
  isLoggedin,
  user
}) => {
  const [chosenProductsVariantsNames, setChosenProductsVariantsNames] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [quantityLimit, setQuantityLimit] = useState(null);
  const [isItemAddedToCart, setIsItemAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  // const [showPleaseLogin, setShowPleaseLogin] = useState(false);
  const [selectVariantError, setSelectVariantError] = useState(false);
  const [isReachedLimit, setIsReachedLimit] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const router = useRouter();

  const detailsRef = useRef(null);
  const isLastOrderCardVisible = useIsVisible(detailsRef);

  const itemToCart = async () => {
    // if(!isLoggedin){
    // setShowPleaseLogin(true);
    // setTimeout(function(){
    //   setShowPleaseLogin(false);
    // }, 2000);
    //   return;
    // }
    if (collection.state !== "Available") return;
    setIsAdding(true);
    const totalPrice = quantity * collection.price; //TODO: Add delivery cost to the Total??
    let chosenProductsVariants = [];
    let isStop = false;
    collection.products.map((product, index) => {
      if (product.productVariants.length === 0){
        setChosenProductsVariantsNames((prev) => {
          const updatedNames = [...prev];
          updatedNames[index] = product.name;
          return updatedNames;
        });
        chosenProductsVariants[index] = product.name;
      }
        // setChosenProductsVariantsNames((prev) => (prev[index] = product.name));}
      else if (product.productVariants.length === 1) {
        chosenProductsVariants[index] = product.productVariants[0].name;
        setChosenProductsVariantsNames(product.productVariants[0].name);
      } else {
        if (!chosenProductsVariantsNames[index]) {
          //To make sure a variant is chosen, add an error that the user needs to choose a variant...
          setSelectVariantError(true);
          setTimeout(function () {
            setSelectVariantError(false);
          }, 3000);
          setIsAdding(false);
          isStop = true;
          return;
        } else chosenProductsVariants[index] = chosenProductsVariantsNames[index];
      }
    });
    if(isStop) return;
    if (!isLoggedin) {
      const localCart = JSON.parse(localStorage.getItem("cart"));
      const id = uuidv4();
      const products = collection.products.map((product) => ({
        imageUrls: [{ url: product.imageUrls[0].url }],
        name: product.name,
        price: product.excerpt,
        id: product.id,
      }));
      const cartItem = {
        id,
        quantity,
        total: totalPrice,
        variant: chosenProductsVariants,
        isCollection: true,
        collectionId: collection.id,
        products,
      };
      const updatedCart = localCart ? [...localCart, cartItem] : [cartItem];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setIsAdding(false);
      setIsAddedToCart(true);
      setIsItemAddedToCart(true);
      setTimeout(function () {
        setIsItemAddedToCart(false);
      }, 2000);
      return;
    }
    //if user logged in, do this⬇️⬇️
    const cartId = user.cartId;
    const isAdded = await addItemToCart({
      //TODO: Fix this
      itemId: collection.id,
      userSlug: user.slug,
      quantity,
      totalPrice,
      cartId,
      chosenProductsVariants,
      isCollection: true,
    });
    await publishCart(cartId); //Needs publish after being updated
    await publishItemAddedToCart(
      isAdded.updateCart.orderItems[isAdded.updateCart.orderItems.length - 1].id
    );
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
  // Define a function to update chosenProductsVariantsNames in the parent
  const updateChosenVariants = (index, variantName) => {
    setChosenProductsVariantsNames((prev) => {
      const updatedNames = [...prev];
      updatedNames[index] = variantName;
      return updatedNames;
    });
  };

  const scrollToBottom = () => {
    detailsRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div ref={detailsRef} className="flex flex-col w-full px-4 ">
        {collection.products[currentImageIndex].productVariants.length > 0 && (
          <div className="left-[31px] top-[88px] text-sm font-bold leading-tight mb-2">
            Variants
          </div>
        )}
        <div className="max-sm:w-full h-fit flex flex-wrap gap-2">
          {collection.products[currentImageIndex].productVariants.map(
            (variant, index) => {
              let isChosen =
                chosenProductsVariantsNames[currentImageIndex] === variant.name;
              return (
                <Variants
                  variant={variant}
                  key={index}
                  setChosenProductsVariantsNames={updateChosenVariants}
                  isChosen={isChosen}
                  isOutOfStock={isOutOfStock}
                  currentImageIndex={currentImageIndex}
                />
              );
            }
          )}
        </div>
      </div>
      <div className="w-full flex justify-center items-center flex-col pb-8 ">
        <div className="fontColor px-4">
          <h1 className="text-xl font-bold mb-1">{collection.name}</h1>
          <div>
            <ReactMarkdown>{collection.description}</ReactMarkdown>
          </div>
        </div>
        <div className="relative py-5 w-full flex flex-col justify-start sm:justify-between item-center text-black ">
          <div className="max-sm:w-3/4 max-sm:pl-5 flex justify-between item-center">
            <div
              className={`${
                isDarkMode ? "bg-neutral-700" : "bg-neutral-100"
              } rounded-full flex justify-between items-center gap-3 fontColor`}
            >
              <button
                onClick={() => {
                  if (quantity > 1) setQuantity(quantity - 1);
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
                ${collection.price * quantity} {/* Make it only collection.price? */}
              </div>
            </div>
          </div>
          {isReachedLimit && (
            <h1 className="text-red-500 mt-1 absolute -bottom-7">
              Chosen Variant Quantity limit reached
            </h1>
          )}
        </div>
        <div className=" w-full flex justify-center bgColor pb-4">
          <button
            disabled={collection.state !== "Available"}
            onClick={itemToCart}
            className={`h-[60px] pl-[86px] pr-[89px] pt-[18px] pb-[17px] ${
              collection.state !== "Available"
                ? "bg-gray-300"
                : "opBgColor"
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
            Please Select Your Desired Variant for Each Product
          </p>
        )}
        {isItemAddedToCart && (
          <p className="text-green-500 text-center ">Item Added Successfuly</p>
        )}
      </div>
      <button
        //TODO: put in seperate component
        disabled={isLastOrderCardVisible}
        onClick={scrollToBottom}
        className={`fixed bottom-4 scrollButton right-4 max-sm:right-3 max-sm:bottom-10 rounded-full fontColor staticBgColor p-2 ${
          !isLastOrderCardVisible ? "show-button " : "hide-button"
        }`}
      >
        <svg
          width="30px"
          height="30px"
          viewBox="0 0 1.8 1.8"
          xmlns="http://www.w3.org/2000/svg"
          className="rotate-180"
        >
          <path d="M0 0h1.8v1.8H0z" fill="none" />
          <g id="Shopicon">
            <path
              fill="currentColor"
              points="6.586,30.586 9.414,33.414 24,18.828 38.586,33.414 41.414,30.586 24,13.172  "
              d="M0.247 1.147L0.353 1.253L0.9 0.706L1.447 1.253L1.553 1.147L0.9 0.494Z"
            />
          </g>
        </svg>
      </button>
    </>
  );
};
const CollectionDetailsPage = ({ collection, user }) => {
  const [isLoggedin, setisLoggedin] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const maxDescriptionWords = 5;
  const descriptionToShow = showFullDescription
    ? collection.products[currentImageIndex].description.replace(
        /\n/g,
        "  \n"
      ) || ""
    : collection.products[currentImageIndex].description
        .split(" ")
        .slice(0, maxDescriptionWords)
        .join(" ");

  const showMoreLessLabel = showFullDescription ? "Show Less" : "Show More";
  function checkOutOfStock() {
    let outOfStock = true;
    if (collection.products[currentImageIndex].productVariants > 0) {
      for (const variant of collection.products[currentImageIndex]
        .productVariants) {
        if (variant.quantity > 0) {
          outOfStock = false;
          break;
        }
      }
    } else outOfStock = false;
    if (collection.products[currentImageIndex].state !== "Available")
      outOfStock = true;
    return outOfStock;
  }

  useEffect(() => {
    setIsOutOfStock(checkOutOfStock());
    if (user) setisLoggedin(true);
  }, [currentImageIndex]);
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

  const rates = collection.products[currentImageIndex].reviews?.map(
    (review) => review.rating
  );
  const rate = rates?.reduce((a, b) => a + b, 0) / rates?.length;
  return (
    <div className=" overflow-y-scroll h-screen overflow-x-hidden flex items-start justify-center pb-10 bgColor  ">
      <div className="max-sm:w-[428px] w-full relative bgColor fontColor max-sm:flex-col gap-6 justify-start flex-wrap items-start max-sm:inline-flex">
        {/*TODO: make scrolling keep the image in its place, and moves the content above it, and maybe make it based on desire? */}
        <div className="sm:flex sm:items-start sm:mb-10 sm:justify-center w-full ">
          <div className="relative max-sm:w-full w-[428px] inline-block bg-[#4bc0d9]">
            <Carousel
              showArrows={true}
              selectedItem={currentImageIndex}
              onChange={(index) => setCurrentImageIndex(index)}
              showThumbs={false}
            >
              {collection.products.map((product, index) => (
                <div
                  key={index}
                  className="relative flex justify-center w-full"
                >
                  <Image
                    className="max-sm:w-[428] max-sm:h-[428] object-cover"
                    width={428}
                    height={428}
                    src={product.imageUrls[0].url}
                    alt={`Image ${index + 1}`}
                  />
                </div>
              ))}
            </Carousel>
          </div>
          <div className="flex flex-col justify-between gap-10 sm:h-screen">
            <div className="max-sm:w-full w-[440px] relative bgColor flex flex-col justify-center px-2 pl-5 gap-4">
              <div>
                <div className="left-[30px] top-[22px] text-xl font-bold mb-1">
                  {collection.products[currentImageIndex].name}
                </div>
                <div className="left-[31px] top-[54px] text-sm font-thin leading-[18px]">
                  {collection.products[currentImageIndex].excerpt ||
                    "Winter Training Full-Zip Hoodie"}
                </div>
                <div className="left-[31px] top-[54px] fontColor text-sm leading-[18px]">
                  <ReactMarkdown className="prose mt-2">
                    {descriptionToShow}
                  </ReactMarkdown>
                  {collection.products[currentImageIndex].description &&
                    collection.products[currentImageIndex].description.split(
                      " "
                    ).length > maxDescriptionWords && (
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

              <h1
                className={`text-xl ${
                  isOutOfStock ? "text-red-500" : "text-green-500"
                } `}
              >
                {isOutOfStock ? "Out of Stock!" : "Available"}
              </h1>
              {/* <div className="relative w-full flex flex-col justify-start sm:justify-between item-center text-black ">
                <div className="w-3/4 flex justify-between item-center">
                  <div
                    className={`${
                      isDarkMode ? "bg-neutral-700" : "bg-neutral-100"
                    } rounded-full flex justify-between items-center gap-3 fontColor`}
                  >
                    <button
                      onClick={() => {
                        if (quantity > 1 && collection.products[currentImageIndex].state === "Available")
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
                      ${collection.products[currentImageIndex].price}
                    </div>
                  </div>
                </div>
                {isReachedLimit && (
                  <h1 className="text-red-500 mt-1 absolute -bottom-7">
                    Chosen Variant Quantity limit reached
                  </h1>
                )}
              </div> */}
              {/* {collection.products[currentImageIndex].reviews && collection.products[currentImageIndex].reviews.length > 0 &&
                  <ReactStars
                    count={5}
                    value={rate}
                    size={16}
                    isHalf={true}
                    activeColors={[ "red", "orange", "#FFCE00", "#FFCE00","#4bc0d9",]}
                    className='absolute bottom-0 right-0'
                  />
                } */}
              <div
                id="tooltip"
                className="relative"
                onMouseEnter={handleToggleTooltip}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {collection.products[currentImageIndex].reviews &&
                  collection.products[currentImageIndex].reviews.length > 0 && (
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
            <AddItemForm
              isLoggedin={isLoggedin}
              isOutOfStock={isOutOfStock}
              isDarkMode={isDarkMode}
              currentImageIndex={currentImageIndex}
              collection={collection}
              user={user}
            />
            {/* <div className="flex flex-col w-full px-4 ">
                {collection.products[currentImageIndex].productVariants.length > 0 && (
                  <div className="left-[31px] top-[88px] text-sm font-bold leading-tight mb-2">
                    Variants
                  </div>
                )}
                <div className="max-sm:w-full h-fit flex flex-wrap gap-2">
                  {collection.products[currentImageIndex].productVariants.map((variant, index) => {
                    let isChosen = chosenProductsVariantsNames[currentImageIndex] === variant.name;
                    return (
                      <Variants
                        variant={variant}
                        key={index}
                        setChosenProductsVariantsNames={
                          setChosenProductsVariantsNames
                        }
                        isChosen={isChosen}
                        isOutOfStock={isOutOfStock}
                        currentImageIndex={currentImageIndex}
                      />
                    );
                  })}
                </div>
            </div> */}
            {/* <div className="w-full text-center text-black text-3xl flex justify-center gap-3"> Total <h1 className="font-bold"> {collection.products[currentImageIndex].price*quantity}</h1>  </div> */}
            {/* <div className="w-full flex justify-center items-center flex-col pb-8 ">
              <div className="fontColor px-4">
                <h1 className="text-xl font-bold mb-1">{collection.name}</h1>
                <div>
                  <ReactMarkdown>
                    {collection.description}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="relative py-5 w-full flex flex-col justify-start sm:justify-between item-center text-black ">
                  <div className="max-sm:w-3/4 max-sm:pl-5 flex justify-between item-center">
                    <div
                      className={`${
                        isDarkMode ? "bg-neutral-700" : "bg-neutral-100"
                      } rounded-full flex justify-between items-center gap-3 fontColor`}
                    >
                      <button
                        onClick={() => {
                          if (quantity > 1)
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
                        ${collection.price * quantity}
                      </div>
                    </div>
                  </div>
                  {isReachedLimit && (
                    <h1 className="text-red-500 mt-1 absolute -bottom-7">
                      Chosen Variant Quantity limit reached
                    </h1>
                  )}
                </div>
              <div className=" w-full flex justify-center bgColor pb-4">
                <button
                  disabled={isOutOfStock}
                  onClick={itemToCart}
                  className={`h-[60px] pl-[86px] pr-[89px] pt-[18px] pb-[17px] ${
                    collection.products[currentImageIndex].state !== "Available" ? "bg-gray-300" : "opBgColor"
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
              {showPleaseLogin && (
                <p className="text-red-500 text-center ">
                  To add item to cart, please Sign in
                </p>
              )}
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
            </div> */}
          </div>
        </div>
        {/* Similars from same Category TODO:Move to a separate component, put in server parent*/}
        {/* {product.categories[0]?.products > 0 && (
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
        )} */}
        {collection.products[currentImageIndex].reviews.length > 0 && (
          <div className="w-full h-1 bgColorGray "></div>
        )}
        <div>
          {collection.reviews.length > 0 && "Collection Reviews"}
          {collection.reviews?.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
        <div>
          {collection.products[currentImageIndex].reviews.length > 0 && "Item Reviews"}
          {collection.products[currentImageIndex].reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailsPage;