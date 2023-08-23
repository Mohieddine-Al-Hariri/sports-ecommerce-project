import Image from "next/image";

const OrderItem = ({ item }) => {
  const { quantity, total, product, id, createdAt, variant } = item;
  
  return (
    <div className="flex justify-around items-center w-screen gap-5 border-b-2 rounded-md">
      <Image width={86} height={108} className="relative w-[86px] h-[108px] rounded-[20px]" src={product.imageUrls[0].url} alt={product.name}  />
      <div className="w-fit relative border border-gray-100 rounded-md p-2 flex-col justify-center items-start inline-flex gap-1">
        <div className="text-neutral-700 text-sm font-bold leading-[18px]">{product.name}</div>
        {/* <div className="w-[114px] text-neutral-700 text-sm font-thin leading-[10px]">{product.excerpt}</div> */}
        <div className="w-[99px] h-[33px] pl-3 pr-[11px] pt-[5px] pb-1 bg-neutral-100 rounded-[22px] justify-center items-start gap-[11px] inline-flex">
          {/* <div className="w-[23px] h-[23px] relative bg-white rounded-[100px] flex-col justify-start items-start flex" /> */}
          <div className="text-black text-sm font-bold leading-normal">{quantity}</div>
          {/* <div className="w-[23px] h-[23px] relative bg-white rounded-[100px] flex-col justify-start items-start flex" /> */}
        </div>
        {variant}
      </div>
      <div className="text-xl fontColor">
        <h1>Total</h1>
        <h1 className="font-bold">${total}</h1>
      </div>
      
    </div>
  )
}

export default OrderItem