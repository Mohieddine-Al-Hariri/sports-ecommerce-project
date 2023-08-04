import Image from 'next/image'
import { StartPage } from "./components"
import { getProducts } from '@/lib'

export async function getProductsData() {
  const products = (await getProducts(undefined)) || [];
  console.log("products in func: ", products)
  return products;
}

export default async function Home() {

  const productsData = await getProductsData();



  return (
    <main className="h-full w-full">
      <StartPage products={productsData.products} hasNextPage={productsData.pageInfo.hasNextPage}/>
    </main>
  )
}
