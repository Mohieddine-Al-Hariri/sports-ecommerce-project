import Image from "next/image";
import { useEffect, useState } from "react";

const CartItem = ({ item, deleteItem, selectedItemsIds, setSelectedItemsIds, selectAll }) => {
  const { quantity, total, product, id, createdAt, variant, collection, orderItemVariants } = item;
  const [isSelected, setIsSelected] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if(selectedItemsIds.includes(id)) {
      setIsSelected(true);
    }
    else {
      setIsSelected(false);
    };
  },[selectAll]);
  const select = () => {
    if(!isSelected) setSelectedItemsIds(prevSelected => [...prevSelected, id]); //when toggled to true
    else setSelectedItemsIds(prevSelected => prevSelected.filter(item => item !== id)) //when toggled false
    setIsSelected(!isSelected);
  };

  return (
    <div className="flex justify-between items-center w-full lg:w-1/3 grow px-2 border-2 borderColor rounded-lg py-1  ">
      <div className="flex items-center gap-2">
        
        <label
          className={`relative cursor-pointer ${
            isSelected
              ? 'border-[#4bc0d9]'
              : 'border-gray-300 hover:border-[#4bc0d9]'
          } border-2 rounded-[20px] transition duration-300`}
          htmlFor={`selectItem ${id}`}
        >
          <input
            className="hidden"
            type="checkbox"
            id={`selectItem ${id}`}
            name="selectItem"
            onChange={select}
            checked={isSelected}
          />
          {!collection ?
            <Image
              width={86}
              height={108}
              className="w-[86px] h-[108px] rounded-[20px] border-2 border-gray-300 hover:border-[#4bc0d9] transition duration-300"
              src={product.imageUrls[0].url}
              alt={product.name}
            /> :
            collection.imageUrl ?
              <Image
                width={86}
                height={108}
                className="w-[86px] h-[108px] rounded-[20px] border-2 border-gray-300 hover:border-[#4bc0d9] transition duration-300"
                src={collection.imageUrl}
                alt={collection.name}
              />
              :
              collection.products.slice(0, 3).map((product) => {
                return (
                  <Image
                    width={86}
                    height={108}
                    className="w-[86px] h-[108px] rounded-[20px] border-2 border-gray-300 hover:border-[#4bc0d9] transition duration-300"
                    src={product.imageUrls[0].url}
                    alt={product.name}
                  />
                )
              })
          }

          <div className={`absolute top-0 left-0 ${isSelected ? "bg-[#4bc0d9] text-gray-100 " : "bg-white text-gray-600"} p-1 rounded-full shadow`}>
            {isSelected ? "Selected" : "Select"}
          </div>
        </label>
      </div>

      <div className="w-fit relative flex-col justify-center items-start inline-flex gap-1">
        <div className="fontColorGray text-sm font-bold leading-[18px]">{collection ? collection.name : product.name}</div>
        {product && <div className="w-[114px] fontColorGray text-sm font-thin leading-[10px]">{product.excerpt}</div>}
        <div className="w-[99px] h-[33px] pl-3 pr-[11px] pt-[5px] pb-1 bg-neutral-100 rounded-[22px] justify-center items-start gap-[11px] inline-flex">
          <div className="text-black text-sm font-bold leading-normal">{quantity}</div>
        </div>
        {collection ? `${orderItemVariants[0]?.name}...` : orderItemVariants[0]?.name}
      </div>
      <div className="text-xl fontColor">
        <h1>Total</h1>
        <h1 className="font-bold">${total}</h1>
      </div>
      <button disabled={isRemoving} onClick={async () => {setIsRemoving(true); await deleteItem(id); setIsRemoving(false)}}>
        {isRemoving ? 
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
        : 
          <svg
            width="28px"
            height="28px"
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
        }
        
      </button>
    </div>
  )
}

export default CartItem