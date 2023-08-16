
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getOrderDetails } from "@/lib";
import OrderDetails from "@/app/components/OrderDetails";

export async function getOrderData(orderId) {
  const OrderDetails = (await getOrderDetails(orderId)) || [];
  console.log("OrderDetails in func: ", OrderDetails)
  return OrderDetails;
}

const page = async ({ params: { id } }) => {
  console.log(id)
  const sessionData = await getServerSession(authOptions);
  const orderDetails = await getOrderData(id);
  console.log("orderDetails: ", orderDetails);
  return <OrderDetails order={orderDetails} user={sessionData?.user} />
}

export default page