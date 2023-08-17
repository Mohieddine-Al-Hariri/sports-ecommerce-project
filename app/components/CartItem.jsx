import { removeItemfromCart } from "@/lib";
import Image from "next/image";

const CartItem = ({ item }) => {
  //TODO: add the ability to remove using id
  const { quantity, total, product, id, createdAt, variant } = item;
  const deleteItem = async () => {
    const removedItemId = await removeItemfromCart(id);
    await publishCart(cartId);
    //TODO: make it update the cart in real time, maybe put it in the parrent comp.
  }
  return (
    <div className="flex justify-around items-center w-screen gap-5 ">
      <Image width={86} height={108} className="relative w-[86px] h-[108px] rounded-[20px]" src={product.images[0].url} alt={product.name}  />
      <div className="w-fit relative border border-gray-100 flex-col justify-center items-start inline-flex gap-1">
        <div className="text-neutral-700 text-sm font-bold leading-[18px]">{product.name}</div>
        <div className="w-[114px] text-neutral-700 text-sm font-thin leading-[10px]">{product.excerpt}</div>
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
      {/* <button onClick={deleteItem}> */}
      <svg
        width="24px"
        height="24px"
        viewBox="0 0 0.45 0.45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="border-white hover:border-gray-500 border-solid border-2 rounded-md "
      >
        <title>Remove Item</title>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.165 0.03a0.015 0.015 0 0 0 0 0.03h0.12a0.015 0.015 0 0 0 0 -0.03h-0.12ZM0.09 0.105a0.015 0.015 0 0 1 0.015 -0.015h0.24a0.015 0.015 0 0 1 0 0.03H0.33v0.24a0.03 0.03 0 0 1 -0.03 0.03H0.15a0.03 0.03 0 0 1 -0.03 -0.03V0.12h-0.015a0.015 0.015 0 0 1 -0.015 -0.015ZM0.15 0.12h0.15v0.24H0.15V0.12Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

export default CartItem