"use client"
import { publishProduct, updateProductState } from "@/lib";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const ProductStateMenu = ({ productState, setProductState, productId, isOpen, setIsOpen }) => {
  const router = useRouter()
  const states = ["Available", "Out_of_Stock", "Removed"];
  // Ref for the card menu container
  const cardMenuRef = useRef(null);

  // Handle click outside the card menu
  const handleClickOutside = (event) => {
    if (cardMenuRef.current && !cardMenuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  // Add click event listener when the component mounts
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const changeProductState = async (state) => {
    const updatedProduct = await updateProductState({productId, state});
    await publishProduct(productId);
    //publishOrderItems && publishTheUser??
    setProductState(updatedProduct.updateProduct.state);
    router.refresh();
  }



  return (
    <div 
      ref={cardMenuRef}
      className="absolute w-48 h-10 bg-white fontColor rounded-t-md right-2 -top-2 pt-1 pr-1 "
    >
      <div>
        <div className='w-full flex justify-end'>
          <button
            className="p-1 fontColorGray hover:text-gray-100 hover:bg-[#2482c8] rounded-full focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg 
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            // fill={!isDarkMode ? '#030303' : '#fff'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="absolute right-0 w-48 fontColor bg-white rounded-md shadow-lg z-10">
          <ul>
            {states.map((state) =>{
              let bg = "bg-white";
              let disable = false;
              let txtClr = "fontColor";
              if(state === productState){
                bg = "bg-[#2482c8]";
                disable = true;
                txtClr = "text-white"
              }
              return(
                <button key={state} disabled={disable} onClick={() => {changeProductState(state); setIsOpen(false)}}  className={`px-4 py-2 rounded-md hover:bg-[#2482c8] hover:text-white ${txtClr} ${bg} flex w-full justify-between `}>
                  {state}
                  {/* {svg} */}
                </button>
              )
            })}
          </ul>
        </div>
      </div>
    
    </div>
  );
  
}

const AdminProductCard = ({ product }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [productState, setProductState] = useState(product.state);
  const router = useRouter();
  let stateTxtClr = "text-green-500";
  if(product.state === "Removed") stateTxtClr = "text-red-500";
  else if(product.state === "Out_of_Stock") stateTxtClr = "text-yellow-500";

  return (
    <div className="flex relative w-full justify-between items-center rounded-md shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] productCardBg fontColor p-2 ">
      <button className="p-1 absolute right-2 top-2 " onClick={() => router.push(`Products/updateProduct/${product.id}`)}>
        <svg
          fill="currentColor"
          width="24px"
          height="24px"
          viewBox="0 0 1.35 1.35"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <title>{"edit-line"}</title>
          <path
            className="clr-i-outline clr-i-outline-path-1"
            d="M1.27 0.312 1.05 0.091a0.078 0.078 0 0 0 -0.11 0L0.16 0.87l-0.071 0.307a0.077 0.077 0 0 0 0.075 0.094 0.08 0.08 0 0 0 0.016 0l0.311 -0.071 0.779 -0.779a0.078 0.078 0 0 0 0 -0.11ZM0.453 1.132l-0.291 0.061 0.066 -0.286L0.812 0.326l0.225 0.225ZM1.087 0.497l-0.225 -0.225 0.131 -0.13 0.221 0.225Z"
          />
          <path
            x={0}
            y={0}
            width={36}
            height={36}
            fillOpacity={0}
            d="M0 0H1.35V1.35H0V0z"
          />
        </svg>
      </button>
      <Image className="rounded-t-md" src={product.imageUrls[0].url} alt={product.name} width={102} height={109.03}/>
      <div className="w-full flex-col text-center fontColor ">
        <div className=" fontColorGray text-sm font-bold ">{product.name.length > 15 ? product.name.slice(0, 11) + '...' : product.name}</div>
        <div className=" fontColorGray text-[10px] font-thin ">{product.excerpt}</div>
        <h1 className="w-full p-1 ">${ product.price }</h1>
        {/* <h1 className="w-full p-1 ">{ product.state }</h1> */}
        {openMenu ?
          <div className="mb-4 relative">
            <ProductStateMenu isOpen={openMenu} setIsOpen={setOpenMenu} productState={productState} setProductState={setProductState} productId={product.id}/>
            <button onClick={() => setOpenMenu(true)} className="border-2 border-gray-500 rounded-full px-3 py-1 ">
              <h1 className={`${stateTxtClr} font-bold`}>{productState}</h1> 
            </button>
          </div>
          :
          <button onClick={() => setOpenMenu(true)} className="border-2 border-gray-500 rounded-full px-3 py-1 mb-4  ">
            <h1 className={`${stateTxtClr} font-bold`}>{productState}</h1>
          </button>
        }
        <div className="px-2 ">
          <button className="rounded-lg bg-blue-500 py-1 text-white w-full " onClick={() => router.push(`/itemsDetails/${product.id}`)}>Details</button>
        </div>
      </div>
    </div>
  )
}

export default AdminProductCard