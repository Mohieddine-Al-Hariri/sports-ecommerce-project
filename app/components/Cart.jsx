"use client"
import CartItem from "./CartItem";
import Link from "next/link";
import SignInBtn from "./SignInBtn";
import { disconnectItemfromCart, publishCart, publishSubmittedOrder, submitOrder } from "@/lib";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const OrderButton = ({ userId, totalPrice, itemsIds, cartId, setSubmittedItemsIds, setIsOrderSubmitted, setSubmitting }) => {
  const router = useRouter();

  const orderItems = async () => {
    setSubmitting(true);
    const submittedOrder = await submitOrder({userId, totalPrice, itemsIds});
    console.log("submittedOrder: ", submittedOrder);
    const itemIds = submittedOrder.createOrder.orderItems.map((item) => item.id);
    setSubmittedItemsIds(itemIds);
    if(submittedOrder.createOrder) {
      await publishSubmittedOrder(submittedOrder.createOrder.id);
      await disconnectItemfromCart({itemsIds, cartId});
      await publishCart(cartId);
      router.refresh();
      setSubmitting(false);
      setIsOrderSubmitted(true);
      setTimeout(function() {
        setIsOrderSubmitted(false);
      }, 3000);
      //TODO: add submitted order✅, you can track it in your profile...
    }else{//something went wrong, plz try again later
    }

  }

  return (
    <div className='pb-20'>
      <button onClick={orderItems} className="w-[343px] h-[50px] px-4 py-2 text-white  bg-black rounded-lg border-black justify-around items-center gap-[3px] flex">
        <div className=" text-center text-[23px] font-semibold flex items-center gap-4">
          <h2>Order</h2>
          <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="none" stroke="#fff" strokeWidth="2" d="M3,18 L1,18 L1,3 L14,3 L14,17 M14,18 L9,18 M6,21 C7.65685425,21 9,19.6568542 9,18 C9,16.3431458 7.65685425,15 6,15 C4.34314575,15 3,16.3431458 3,18 C3,19.6568542 4.34314575,21 6,21 Z M17,21 C18.6568542,21 20,19.6568542 20,18 C20,16.3431458 18.6568542,15 17,15 C15.3431458,15 14,16.3431458 14,18 C14,19.6568542 15.3431458,21 17,21 Z M14,8 L19,8 L23,13 L23,18 L20,18"/>
          </svg>
        </div>
      </button>
    </div>
  )
}
export const GoShopping = () => {
  return (
    <div className='pb-20'>
      <Link href="/" className="w-[343px] h-[50px] px-4 py-2 text-white  bg-black rounded-lg border-black justify-around items-center gap-[3px] flex">
        <div className=" text-center text-[23px] font-semibold flex items-center gap-4">
          <h2>Go Shopping</h2>
          <svg fill="currentColor" width="30px" height="30px" viewBox="0 0 0.9 0.9" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="m0.785 0.075 0.037 0.671a0.075 0.075 0 0 1 -0.071 0.079l-0.004 0H0.152a0.075 0.075 0 0 1 -0.075 -0.075c0 -0.002 0 -0.002 0 -0.004L0.115 0.075h0.671Zm-0.6 0.075 -0.033 0.6h0.596l-0.033 -0.6H0.185ZM0.263 0.225h0.075v0.094c0 0.047 0.052 0.094 0.112 0.094s0.112 -0.047 0.112 -0.094V0.225h0.075v0.094c0 0.09 -0.087 0.169 -0.188 0.169s-0.188 -0.079 -0.188 -0.169V0.225Z"/></svg>
        </div>
      </Link>
    </div>
  )
}



const Cart = ({ cartItems, user, hasNextPage }) => {
  //TODO: Add selecting functionality to order
  const [submittedItemsIds, setSubmittedItemsIds] = useState([]);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  console.log("cartItems: ", cartItems);
  return (
    <div className='flex flex-col items-center justify-between p-4 h-screen w-screen bg-white overflow-y-scroll overflow-x-hidden'>
      <div className="w-screen fontColor">
        <h1 className=" text-xl font-bold text-center py-10 ">Cart</h1>
        {isOrderSubmitted && 
          <div className="text-3xl w-full h-full flex flex-col justify-center items-center text-center"> 
            <h1 className="text-green-500">Order Submitted</h1>
            <h2>You can track it in your profile</h2> 
          </div>
        }
        {submitting && <h1 className="text-3xl w-full h-full flex flex-col justify-center items-center text-green-500">Submitting...
            <div role="status">
              <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </h1>}
        {cartItems?.length > 0 ? 
          cartItems.map((item) => {
            // const isSumbitted = submittedItemsIds.includes(item.id);
            // return(
            //   !isSumbitted && <CartItem item={item} key={item.id}/>
            // )
            return <CartItem item={item} key={item.id}/>
          }) :
          <h1 className="text-3xl w-full h-full flex justify-center items-center">No Items in Cart</h1>
        }
        
      </div>
      {cartItems?.length > 0 ? <OrderButton setSubmitting={setSubmitting} setIsOrderSubmitted={setIsOrderSubmitted} setSubmittedItemsIds={setSubmittedItemsIds} cartId={user?.cartId} userId={user?.id} totalPrice={cartItems?.reduce((acc, item) => acc + item.total, 0)} itemsIds={cartItems.map((item) => item.id)} /> 
      :
      user? <GoShopping /> : <SignInBtn /> }
    </div>
  )
}

export default Cart