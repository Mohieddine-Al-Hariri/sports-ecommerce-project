import OrderCard from "./OrderCard"

const AdminOrders = ({ orders, hasNextPage }) => {
  console.log(orders[0].node.theUser);
  return (
    <div className='flex flex-col items-center justify-between p-4 h-screen w-screen bg-white overflow-y-scroll overflow-x-hidden' >
      {orders.map((order) => (
        <OrderCard key={order.node.id} order={order.node} />
      ))}
      AdminOrders
    </div>
  )
}

export default AdminOrders