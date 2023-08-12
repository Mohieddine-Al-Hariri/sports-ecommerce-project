"use client";
import { addItemToCart, publishItemAddedToCart } from "@/lib";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Variants({ variant, setChosenProductVariantId, bg, txtClr }) {
  return (
    <button
      onClick={() => setChosenProductVariantId(variant.id)}
      className={` ${bg} ${txtClr} w-fit h-fit p-2 flex-col justify-start items-start inline-flex rounded-full `}
    >
      {/* <div className={`w-11 h-11 rounded-full border border-zinc-800`} /> */}
      <div className="text-sm font-bold leading-normal">{variant.name}</div>
    </button>
  );
}

const ItemsDetailsPage = ({ product, user }) => {
  //TODO: Add similar items??
  console.log("product: ", product);
  const [chosenProductVariantId, setChosenProductVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isItemAddedToCart, setIsItemAddedToCart] = useState(false);
  const [isLoggedin, setisLoggedin] = useState(false);
  const [showPleaseLogin, setShowPleaseLogin] = useState(false)
  
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
    const totalPrice = quantity * product.price;
    const isAdded = await addItemToCart({itemId: product.id, userSlug: user.slug, quantity, totalPrice});
    console.log("isAdded: ", isAdded);
    await publishItemAddedToCart(isAdded.createOrderItem.id);
    setIsItemAddedToCart(!!isAdded.length); //TODO:
    setTimeout(function(){
      setIsItemAddedToCart(false);
    }, 2000);
  } 

  return (
    <div className=" overflow-y-scroll overflow-x-hidden flex items-start justify-center px-2 ">
      <div className="w-[428px] h-screen relative bg-white flex-col gap-6 justify-start items-start inline-flex">
        <Image
          className="w-[428px] h-[428px]"
          width={428}
          height={428}
          src={product.images[0].url}
          alt={product.name}
        />
        {/* {product.images.map((image) => (
          <Image width={86} height={108} className="relative w-[86px] h-[108px] rounded-[20px]" src={image.url} alt="hello"  />
        ))} */}
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
                if (chosenProductVariantId === variant.id) {
                  bg = "bg-zinc-800";
                  txtClr = "text-white";
                }
                return (
                  <Variants
                    variant={variant}
                    key={index}
                    setChosenProductVariantId={setChosenProductVariantId}
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
          <div className=" w-full flex justify-center bg-white pb-4">
            <button onClick={itemToCart} className="h-[60px] pl-[86px] pr-[89px] pt-[18px] pb-[17px] bg-zinc-800 rounded-full justify-center items-start gap-[15px] inline-flex">
              <div className="text-white text-xl font-bold leading-normal">
                Add to cart
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
