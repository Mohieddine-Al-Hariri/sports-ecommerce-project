import Image from "next/image"

const Order = ({ order }) => {
  let stateColor = "text-green-500";
  if (order.state === "Cancelled" || order.state === "Deleted") stateColor = "text-red-500";
  else if(order.state === "Delivering") stateColor = "text-blue-500";
  else if(order.state === "Ordered") stateColor = "text-yellow-500";
  
  return (
    <div className="flex fontColor gap-2 p-2 justify-between items-center border-2 borderColor border-solid rounded-lg">
      <Image src={order.orderItems[0].product.images[0].url} width={30} height={30} className="" alt={order.orderItems[0].product.name}/>
      {/* <Image src={order.orderItems[0].product.imageUrl} /> */}
      <h1 className={`${stateColor} font-bold`}>{order.state}</h1>
      <h1>{order.total}</h1>
      <div className="flex ">
        <button className="hover:border-black border-2 border-white rounded-md px-2 ">
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
        </button>
        {order.state === "Recieved" &&
          <button title="Remove" className="hover:border-black border-2 border-white rounded-md ">
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