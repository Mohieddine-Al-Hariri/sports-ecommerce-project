import Image from 'next/image'
import { StartPage } from "./components"
import { getCategories, getProducts } from '@/lib'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function getProductsData(searchText, category) {
  const products = (await getProducts(undefined, searchText, category)) || [];
  return products;
}
export async function getCategoriesData() {
  const Categories = (await getCategories()) || [];
  return Categories;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default async function Home({ searchParams: { searchText, category } }) {
  const sessionData = await getServerSession(authOptions);
  const productsData = await getProductsData(searchText, category);
  const categoriesData = await getCategoriesData();

  if(!productsData) 
  return (
    <div className="w-full h-full px-[63px] pt-[426px] pb-[95.82px] bg-white flex-col justify-end items-center gap-[291px] inline-flex">
    <div className="text-black text-[64px] font-bold">Gear Up</div>
    <div className="flex justify-between w-full ">
      <Image width={60} height={60} className="w-[58px] h-[29.59px] " alt={generalAlt} src="/image 3.png" />
      <Image width={60} height={60} className="w-[58px] h-[39.18px] " alt={generalAlt} src="/Logo.svg" />
      <Image width={60} height={60} className="w-[58px] h-[29.59px] " alt={generalAlt} src="/image 9.png" />
    </div>
  </div>
  );
  return (
    <main className="h-full w-full">
      <StartPage 
        categoriesData={categoriesData} 
        searchedCategory={category} 
        products={productsData.products} 
        hasNextPage={productsData.pageInfo.hasNextPage}
        searchText={searchText} 
        user={sessionData?.user}
      />
    </main>
  )
}
