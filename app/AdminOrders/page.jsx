import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAdminOrders } from "@/lib";
import { AdminOrders } from "../components";

export async function getAllOrders(cursor, querySearchtext) {
  const allOrders = (await getAdminOrders(cursor, querySearchtext)) || [];
  console.log("allOrders in func: ", allOrders)
  return allOrders;
}

const page = async ({ cursor, querySearchtext }) => {
  const session = await getServerSession(authOptions);
  if(!session) {
    redirect('/SignIn');
  }
  // if(session.user.userRole !== "Admin") redirect('/');
  
  const allOrdersData = await getAllOrders(cursor, querySearchtext);

  return <AdminOrders orders={allOrdersData.orders} hasNextPage={allOrdersData.pageInfo.hasNextPage} />
}

export default page