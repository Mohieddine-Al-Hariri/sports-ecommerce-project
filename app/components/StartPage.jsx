"use client"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react"



const StartPage = ({ products, hasNextPage, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [doesHaveNextPage, setDoesHaveNextPage] = useState(false);
  const [productsState, setProductsState] = useState([]);

  const generalAlt = "Gear Up - Sports";

  console.log(products);

  useEffect(() => {
    setProductsState(products);
    setDoesHaveNextPage(hasNextPage);
  },[])

  if(isLoading)
    return (
      <div className="w-full h-full px-[63px] pt-[426px] pb-[95.82px] bg-white flex-col justify-end items-center gap-[291px] inline-flex">
      <div className="text-black text-[64px] font-bold">Gear Up</div>
      <div className="flex justify-between w-full ">
        <Image width={60} height={60} className="w-[58px] h-[29.59px] " alt={generalAlt} src="/image 3.png" />
        <Image width={60} height={60} className="w-[58px] h-[39.18px] " alt={generalAlt} src="/Logo.svg" />
        <Image width={60} height={60} className="w-[58px] h-[29.59px] " alt={generalAlt} src="/image 9.png" />
      </div>
    </div>
    );
  return (
    <div className="w-full h-full gap-20 relative bg-white flex-col justify-start items-center py-10 inline-flex overflow-y-scroll">
      <div className="w-[333px] h-[364px] overflow-hidden relative bg-gray-100 rounded-[20px] ">
        <Image width={210} height={210} className="w-[210px] h-[208.49px] left-[-54px] top-[-50px] absolute" alt={generalAlt} src="/image 3.png" />
        <Image width={210} height={210} className="w-[210px] h-[210px] left-[156px] top-[-52px] absolute" alt={generalAlt} src="/image 4.png" />
        <Image width={210} height={210} className="w-[210px] h-[210px] left-[17px] top-[97px] absolute" alt={generalAlt} src="/image 5.png" />
        <Image width={58} height={39} className="w-[210px] h-[210px] left-[207px] top-[97px] absolute" alt={generalAlt} src="/image 10.png" />
        <div className="w-[269px] left-[22px] top-[293px] absolute text-neutral-700 text-sm font-thin leading-tight">An excellent choice for those who want convenience and comfort while playing sports</div>
        <Image width={210} height={210} className="w-[58px] h-[39.18px] left-[137px] top-[97px] absolute" alt={generalAlt} src="/image 2.png" />
        <div className="left-[22px] top-[268px] absolute text-neutral-700 text-xl font-bold leading-tight">Designed for the gym.</div>
      </div>
      <div>
        <div className=" text-neutral-700 text-xl font-bold leading-normal ml-5">Items</div>
        <div className="w-full h-full flex items-start justify-between flex-wrap gap-4 p-4 relative">
          {productsState.map((item, index) => (
            <Link href={`/itemsDetails/${item.node.id}`} key={index} className="w-[108px] h-full gap-0 p-2 rounded-md shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
              <Image width={102} height={109.03} className="w-[102px] h-[109.03px] left-0 top-0 rounded-[20px]" alt={item.name} src={item.node.images[0].url} />
              <div className="w-full text-neutral-700 text-sm font-bold leading-[18px]">Лонгслив</div>
              <div className="w-full text-neutral-700 text-[10px] font-thin leading-[10px]">Long sleeve FB Hype</div>
            </Link>
          ))}
        </div>
      </div>
      
    </div>
  )
}

export default StartPage