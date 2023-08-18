"use client";
import { addItemToCart, publishCart, publishItemAddedToCart } from "@/lib";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import the carousel styles

export function Variants({ variant, setChosenProductVariantName, bg, txtClr }) {
  return (
    <button
      onClick={() => setChosenProductVariantName(variant.name)}
      // onClick={() => setChosenProductVariantId(variant.id)}
      className={` ${bg} ${txtClr} w-fit h-fit p-2 flex-col justify-start items-start inline-flex rounded-full `}
    >
      {/* <div className={`w-11 h-11 rounded-full border border-zinc-800`} /> */}
      <div className="text-sm font-bold leading-normal">{variant.name}</div>
    </button>
  );
}

const ItemsDetailsPage = ({ product, user }) => {
  //TODO: Add similar items??
  const [chosenProductVariantName, setChosenProductVariantName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isItemAddedToCart, setIsItemAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoggedin, setisLoggedin] = useState(false);
  const [showPleaseLogin, setShowPleaseLogin] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if(user) setisLoggedin(true);
  }, [])

  const itemToCart = async () => {
    if(!isLoggedin){
      setShowPleaseLogin(true);
      setTimeout(function(){
        setShowPleaseLogin(false);
      }, 2000);
      return;
    }
    setIsAdding(true);
    const totalPrice = quantity * product.price;
    const cartId= user.cartId
    let chosenProductVariant = ""
    if(product.variants.length === 1){
      chosenProductVariant = product.variants[0].name;
      setChosenProductVariantName(product.variants[0].name);
    }else{ 
      if(!chosenProductVariantName){ //To make sure a variant is chosen
        //maybe add an error that the user needs to choose a variant...
        chosenProductVariant = product.variants[0].name;
        setChosenProductVariantName(product.variants[0].name);
      } else chosenProductVariant = chosenProductVariantName;
    }
    const isAdded = await addItemToCart({itemId: product.id, userSlug: user.slug, quantity, totalPrice, cartId, chosenProductVariant});
    await publishCart(cartId); //Needs publish after being updated
    await publishItemAddedToCart(isAdded.updateCart.orderItems[isAdded.updateCart.orderItems.length - 1].id);
    setIsAdding(false);
    setIsItemAddedToCart(true); //TODO:
    setTimeout(function(){
      setIsItemAddedToCart(false);
    }, 2000);
  } 

  return (
    <div className=" overflow-y-scroll h-screen  overflow-x-hidden flex items-start justify-center px-2 pb-10 bgColor  ">
      <div className="w-[428px] relative bg-white flex-col gap-6 justify-start items-start inline-flex">

        <div className="relative w-full">
          <Carousel
            showArrows={true}
            selectedItem={currentImageIndex}
            onChange={(index) => setCurrentImageIndex(index)}
            
          >
            {product.imageUrls.map((image, index) => (
              <div key={index} className="relative flex justify-center w-full ">
                <Image
                  className="w-[428] h-[428]"
                  width={428}
                  height={428}
                  src={image.url}
                  alt={`Image ${index + 1}`}
                />
              </div>
            ))}
          </Carousel>
        </div>

        <div className="w-full relative bg-white flex flex-col justify-center px-2 pl-5 gap-4">
          <div>
            <div className="left-[30px] top-[22px] text-black text-xl font-bold mb-1">
              {product.name}
            </div>
            {/* TODO: Add description👇🏻👇🏻 */}
            <div className="left-[31px] top-[54px] text-black text-sm font-thin leading-[18px]">
              {product.excerpt || "Winter Training Full-Zip Hoodie"}
            </div>
          </div>
          <div>
            <div className="left-[31px] top-[88px] text-black text-sm font-bold leading-tight mb-2">
              Variants
            </div>
            <div className="w-screen h-fit left-[30px] top-[122px] flex flex-wrap gap-2">
              {product.variants.map((variant, index) => {
                let bg = "bg-neutral-100";
                let txtClr = "text-neutral-700";
                if (chosenProductVariantName === variant.name) {
                  bg = "bg-zinc-800";
                  txtClr = "text-white";
                }
                return (
                  <Variants
                    variant={variant}
                    key={index}
                    setChosenProductVariantName={setChosenProductVariantName}
                    bg={bg}
                    txtClr={txtClr}
                  />
                );
              })}
            </div>
          </div>
          <div className="w-full flex justify-start item-center text-black ">
            <div className=" w-3/4 flex justify-between item-center">
              <div className="bg-neutral-100 rounded-full flex justify-between items-center gap-3">
                <button
                  onClick={() => {
                    if (quantity > 0) setQuantity(quantity - 1);
                  }}
                  className="rounded-full bg-white w-10 h-10 p-2 text-4xl flex justify-center items-center"
                >
                  -
                </button>
                <h3 className="text-2xl">{quantity}</h3>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-full bg-white w-10 h-10 p-2 text-4xl flex justify-center items-center"
                >
                  +
                </button>
                {/* TODO: Add Limit to adding quantity */}
              </div>
              <div>
                <div className=" text-black text-xs font-thin leading-[14px]">
                  Price
                </div>
                <div className="text-black text-2xl font-semibold leading-7">
                  ${product.price}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="w-full text-center text-black text-3xl flex justify-center gap-3"> Total <h1 className="font-bold"> {product.price*quantity}</h1>  </div> */}
        <div className="w-full flex justify-center items-center flex-col ">
          <div className=" w-full flex justify-center  bg-white pb-4">
            <button onClick={itemToCart} className="h-[60px] pl-[86px] pr-[89px] pt-[18px] pb-[17px] bg-zinc-800 rounded-full justify-center items-start gap-[15px] inline-flex">
              {/* TODO: when added to cart, change button text: Added to Cart✅ */}
              <div className="text-white text-xl font-bold leading-normal">
                {isAdding ? 
                  <div role="status">
                    <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                  : "Add to cart"
                }
                {/* Add to cart */}
              </div>
            </button>
          </div>
          {showPleaseLogin && <p className="text-red-500 text-center ">Sign In to add item to cart</p>}
          {isItemAddedToCart && <p className="text-green-500 text-center ">Item Added Successfuly</p>}
        </div>
      </div>
    </div>
  );
};

export default ItemsDetailsPage;
