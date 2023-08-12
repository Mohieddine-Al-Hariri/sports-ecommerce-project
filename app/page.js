import Image from 'next/image'
import { StartPage } from "./components"
import { getProducts } from '@/lib'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function getProductsData() {
  const products = (await getProducts(undefined)) || [];
  // console.log("products in func: ", products)
  return products;
}

export default async function Home() {
  const sessionData = await getServerSession(authOptions);
  const productsData = await getProductsData();
  console.log(sessionData?.user);
  return (
    <main className="h-full w-full">
      <StartPage products={productsData.products} hasNextPage={productsData.pageInfo.hasNextPage} user={sessionData?.user}/>
    </main>
  )
}
