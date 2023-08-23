"use client";
import { publishOrder, removeOrder, updateOrderState } from "@/lib";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useState } from "react";

const Order = ({ order }) => {
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();
  let stateColor = "text-green-500";
  if (order.state === "Cancelled" || order.state === "Deleted") stateColor = "text-red-500";
  else if(order.state === "Delivering") stateColor = "text-blue-500";
  else if(order.state === "Ordered") stateColor = "text-yellow-500";
  
  const cancelOrder = async () => { 
    setCancelling(true);
    await updateOrderState({ orderId: order.id , state: "Cancelled" });
    await publishOrder(order.id);
    router.refresh();
    setCancelling(false);
  }

  const removeOrderFromUsersView = async () => {
    await removeOrder(order.id);
    await publishOrder(order.id);
    router.refresh();
  }

  return (
    <div className="flex fontColor gap-2 p-2 justify-between items-center border-2 borderColor border-solid rounded-lg">
      <Image src={order.orderItems[0].product.imageUrls[0].url} width={30} height={30} className="" alt={order.orderItems[0].product.name}/>
      {/* <Image src={order.orderItems[0].product.imageUrl} /> */}
      <h1 className={`${stateColor} font-bold`}>{order.state}</h1>
      <h1>{order.total}</h1>
      <div className="flex ">
        {order.state !== "Recieved" && order.state !== "Delivering" &&
          <button disabled={cancelling} onClick={cancelOrder} className="hover:border-black border-2 border-white rounded-md px-2 ">
            {cancelling ? 
              <div role="status">
                <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
              </div> 
              : 
              <svg
                fill="currentColor"
                width="30px"
                height="30px"
                viewBox="0 0 36 36"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <title>{"Cancel Order"}</title>
                <path
                  className="clr-i-outline clr-i-outline-path-1"
                  d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM4,18A13.93,13.93,0,0,1,7.43,8.85L27.15,28.57A14,14,0,0,1,4,18Zm24.57,9.15L8.85,7.43A14,14,0,0,1,28.57,27.15Z"
                  />
                <rect x={0} y={0} width={36} height={36} fillOpacity={0} />
              </svg>
            }
          </button>
        }
        {(order.state === "Recieved" || order.state === "Cancelled") &&
          <button onClick={removeOrderFromUsersView} title="Remove" className="hover:border-black border-2 border-white rounded-md ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={39}
              height={39}
              viewBox="0 0 39 39"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path x1={18} y1={6} x2={6} y2={18} d="M29.25 9.75L9.75 29.25" />
              <path x1={6} y1={6} x2={18} y2={18} d="M9.75 9.75L29.25 29.25" />
            </svg>
          </button>
        }
      </div>
    </div>
  )
}

export default Order