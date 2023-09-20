"use client";
import CartItem from "./CartItem";
import Link from "next/link";
import SignInBtn from "./SignInBtn";
import {
  disconnectItemfromCart,
  publishCart,
  publishOrder,
  removeItemfromCart,
  submitOrder,
} from "@/lib";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SVGLoading } from ".";

export const OrderButton = ({
  userId,
  totalPrice,
  itemsIds,
  cartId,
  setIsOrderSubmitted,
  isSubmitting,
  setSubmitting,
  setSelectedItemsIds,
}) => {
  const router = useRouter();

  const orderItems = async () => {
    setSubmitting(true);
    const submittedOrder = await submitOrder({ userId, totalPrice, itemsIds });
    // const itemIds = submittedOrder.createOrder.orderItems.map(
    //   (item) => item.id
    // );
    if (submittedOrder.createOrder) {
      await publishOrder(submittedOrder.createOrder.id);
      await disconnectItemfromCart({ itemsIds, cartId });
      await publishCart(cartId);
      router.refresh();
      setSubmitting(false);
      setIsOrderSubmitted(true);
      setSelectedItemsIds([]);
      setTimeout(function () {
        setIsOrderSubmitted(false);
      }, 3000);
    } else {
      setError(true);
      setTimeout(function () {
        setError(false);
      }, 3000);
      //something went wrong, plz try again later
    }
  };

  return (
    <div className="pb-20 " >
      <button
        disabled={!itemsIds.length || isSubmitting}
        onClick={orderItems}
        className={`w-[343px] h-[50px] px-4 py-2  ${
          itemsIds.length  ? "bg-[#4bc0d9] text-white hover:bg-[#3ca8d0]" : "bg-gray-300"
        }  rounded-lg border-black justify-around items-center gap-[3px] flex`}
      >
        <div className=" text-center text-[23px] font-semibold flex items-center gap-4">
          <h2>{isSubmitting ? "Submitting" : "Order"}</h2>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              d="M3,18 L1,18 L1,3 L14,3 L14,17 M14,18 L9,18 M6,21 C7.65685425,21 9,19.6568542 9,18 C9,16.3431458 7.65685425,15 6,15 C4.34314575,15 3,16.3431458 3,18 C3,19.6568542 4.34314575,21 6,21 Z M17,21 C18.6568542,21 20,19.6568542 20,18 C20,16.3431458 18.6568542,15 17,15 C15.3431458,15 14,16.3431458 14,18 C14,19.6568542 15.3431458,21 17,21 Z M14,8 L19,8 L23,13 L23,18 L20,18"
            />
          </svg>
        </div>
      </button>
    </div>
  );
};
export const GoShopping = () => {
  return (
    <div className="pb-20">
      <Link
        href="/"
        className="w-[343px] h-[50px] px-4 py-2 bg-[#4bc0d9] text-white hover:bg-[#3ca8d0] rounded-lg justify-around items-center gap-[3px] flex"
      >
        <div className=" text-center text-[23px] font-semibold flex items-center gap-4">
          <h2>Go Shopping</h2>
          <svg
            fill="currentColor"
            width="30px"
            height="30px"
            viewBox="0 0 0.9 0.9"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="m0.785 0.075 0.037 0.671a0.075 0.075 0 0 1 -0.071 0.079l-0.004 0H0.152a0.075 0.075 0 0 1 -0.075 -0.075c0 -0.002 0 -0.002 0 -0.004L0.115 0.075h0.671Zm-0.6 0.075 -0.033 0.6h0.596l-0.033 -0.6H0.185ZM0.263 0.225h0.075v0.094c0 0.047 0.052 0.094 0.112 0.094s0.112 -0.047 0.112 -0.094V0.225h0.075v0.094c0 0.09 -0.087 0.169 -0.188 0.169s-0.188 -0.079 -0.188 -0.169V0.225Z"
            />
          </svg>
        </div>
      </Link>
    </div>
  );
};

const Cart = ({ cartItems, user, hasNextPage }) => {
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItemsIds, setSelectedItemsIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [error, setError] = useState(false);
  const [items, setItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
    if(isDarkModeLocal) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    const localCart = JSON.parse(localStorage.getItem("cart"));
    if(!user) setItems(localCart)
    else setItems(cartItems)
  }, [cartItems])

  useEffect(() => {
    if(selectedItemsIds.length === cartItems?.length) setSelectAll(true);
    else setSelectAll(false);
  }, [selectedItemsIds])

  const deleteItem = async (itemId) => {
    setError(false);
    try {
      // Check if a user is authenticated
      if (!user) {
        // If not authenticated, update the local cart (if it exists)
        const localCart = JSON.parse(localStorage.getItem("cart"));
        if (localCart) {
          const updatedCart = localCart.filter((item) => item.id !== itemId);
          localStorage.setItem("cart", JSON.stringify(updatedCart));
          setItems(updatedCart);
        }
      } else {
        // If authenticated, remove the item from the user's cart
        await removeItemfromCart(itemId);
        // Publish the updated cart
        await publishCart(user.cartId);
        // Refresh the router to reflect changes
        router.refresh();
        // Update the state with the latest cart items (assuming "cartItems" is updated elsewhere)
        setItems(cartItems);
      }
    } catch (error) {
      // Handle errors that may occur during item deletion (e.g., network errors)
      console.error('Error deleting item:', error);
      // Set an error flag or perform error handling as needed
      setError(true);
    }
  };

  const selectAllItems = async () => {
    if (!selectAll) setSelectedItemsIds(cartItems.map((item) => item.id));
    else setSelectedItemsIds([]);
    setSelectAll(!selectAll);
  };

  return (
    <div className="flex flex-col items-center justify-between p-4 pb-10 h-screen w-screen bgColor fontColor overflow-y-scroll overflow-x-hidden">
      <div className="w-screen fontColor pb-5 ">
        <h1 className=" text-2xl font-bold text-center py-8 ">Cart</h1>
        {isOrderSubmitted && (
          <div className="text-3xl w-full h-full flex flex-col justify-center items-center text-center">
            <h1 className="text-green-500">Order Submitted</h1>
            <h2>You can track it in your profile</h2>
          </div>
        )}
        
        <div className={`w-full transition-transform ${submitting ? 'h-[200px]' : 'h-0'}`}>
          <h1 className={`text-3xl w-full h-[200px] transition duration-200 ${submitting ? 'scale-100' : 'scale-0'} flex flex-col justify-center items-center text-[#4bc0d9]`}>
            Submitting...
            <SVGLoading/>
          </h1>
        </div>

        {!submitting && (
          <React.Fragment >
            <h3 className="p-4 pb-2 text-2xl font-semibold fontColorGray border-b border-gray-300">
              {items?.length} Items
            </h3>
            {items?.length > 0 && (
              <div className="flex items-center gap-4 pl-4 py-2 bg-gray-100 rounded-md shadow-md mt-4 mb-2">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer" htmlFor="selectAll">
                  <input
                    type="checkbox"
                    id="selectAll"
                    name="selectAll"
                    onChange={selectAllItems}
                    checked={selectAll}
                    className="text-[#4bc0d9] rounded"
                  />
                  <span className="text-lg font-semibold">
                    {selectedItemsIds.length} Items Selected
                  </span>
                </label>
                {/* You can add more interactive elements or content here */}
              </div>
            )}
          </React.Fragment>

        )}
        {items?.length > 0 ? (
          <div className="flex max-lg:flex-col gap-2 px-2 lg:flex-wrap ">
            {items.map((item) => {
              return (
                <CartItem
                  cartId={user?.cartId}
                  item={item}
                  key={item.id}
                  deleteItem={deleteItem}
                  selectedItemsIds={selectedItemsIds}
                  setSelectedItemsIds={setSelectedItemsIds}
                  selectAll={selectAll}
                />
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center text-center gap-2 px-2 ">
            <h1 className="text-3xl ">
              No Items in Cart
            </h1>
            {user && <p>If your Item isn't showing, please wait a minute and refresh</p>}
          </div>
        )}
      </div>
      {/* keep btn & "Cart" fixed while scrolling between items? */}
      {error && <p className="text-red-500">Something went wrong... plz try again later</p>}
      {cartItems?.length > 0 ? (
        <OrderButton
          isSubmitting={submitting}
          setSubmitting={setSubmitting}
          setIsOrderSubmitted={setIsOrderSubmitted}
          cartId={user?.cartId}
          userId={user?.id}
          totalPrice={
            items
              .filter(item => selectedItemsIds.includes(item.id)) // Filter items with matching IDs
              .reduce((acc, item) => acc + item.total, 0) // Calculate total price for filtered items
          }
          // totalPrice={items?.reduce((acc, item) => acc + item.total, 0)}
          itemsIds={selectedItemsIds}
          setSelectedItemsIds={setSelectedItemsIds}
        />
      ) : user ? (
        <GoShopping />
      ) : (
        <SignInBtn />
      )}
    </div>
  );
};

export default Cart;
