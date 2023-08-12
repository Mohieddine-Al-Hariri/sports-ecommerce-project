"use client"
import Image from "next/image"
import CartItem from "./CartItem";
import Link from "next/link";
import SignInBtn from "./SignInBtn";
import { publishSubmittedOrder, submitOrder } from "@/lib";

export const OrderButton = ({ userId, totalPrice, itemsIds }) => {

  const orderItems = async () => {
    const submittedOrder = await submitOrder({userId, totalPrice, itemsIds});
    console.log("submittedOrder: ", submittedOrder);
    if(submittedOrder.createOrder) {
      await publishSubmittedOrder(submittedOrder.createOrder.id);
      // remove ordered items
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
  
  // console.log(cartItems);
  return (
    <div className='flex flex-col items-center justify-between p-4 h-screen w-screen bg-white overflow-y-scroll overflow-x-hidden'>
      <div className="w-screen fontColor">
        <h1 className=" text-xl font-bold text-center py-10 ">Cart</h1>
        {cartItems?.length > 0 ? 
          cartItems.map((item) => (
            <CartItem item={item.node}/>
          )) :
          <h1 className="text-3xl w-full h-full flex justify-center items-center">No Items in Cart</h1>
        }
        
      </div>
      {cartItems?.length > 0 ? <OrderButton userId={user?.id} totalPrice={cartItems?.reduce((acc, item) => acc + item.node.total, 0)} itemsIds={cartItems.map((item) => item.node.id)} /> : user? <GoShopping /> : <SignInBtn /> }
    </div>
  )
}

export default Cart