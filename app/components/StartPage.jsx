"use client"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react"
import SearchBar from "./SearchBar";
import { useIsVisible } from "./UseVisible";
import { getProducts } from "@/lib";
import { useRouter } from 'next/navigation';



const StartPage = ({ products, hasNextPage, user, searchText, categoriesData, searchedCategory }) => {
  const [productsState, setProductsState] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  //Pagination
  const [lastProductCursor, setLastProductCursor] = useState(products[products.length - 1]?.cursor);
  const [doesHaveNextPage, setDoesHaveNextPage] = useState(hasNextPage);
  const lastProductCardRef = useRef();
  const isLastProductCardVisible = useIsVisible(lastProductCardRef);
  const [isFirstRedner, setIsFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchedCategory || 'All');

  const router = useRouter();

  const generalAlt = "Gear Up - Sports";

  useEffect(() => {
    setProductsState(products);
    setDoesHaveNextPage(hasNextPage);
  },[products, hasNextPage])

  const getMoreProducts = async () => {
    const searchedCategory = undefined; //Make it related to collections later...
    //TODO: create an env var specific for this pagination...
    const paginatedProducts = await getProducts(lastProductCursor, searchText, searchedCategory);
    return paginatedProducts;
  }
  useEffect(() => {
    //TODO: Create a env var specific for this pagination, make the key limited to reading products only
    if(isFirstRedner){
      setIsFirstRender(false);
    }
    else if(doesHaveNextPage && !isLoading){
      setIsLoading(true);
      getMoreProducts().then((result) => {    
        result.pageInfo.hasNextPage && setLastProductCursor(result.products[result.products.length - 1].cursor);
        setDoesHaveNextPage(result.pageInfo.hasNextPage);
        setProductsState([ ...productsState, ...result.products]);
        setIsFirstRender(true);
        setIsLoading(false);
      });
    }
  },[isLastProductCardVisible]);


  useEffect(() => { //TODO: Add dark mode
  //   const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
  //   if(isDarkModeLocal) document.body.classList.add('dark');
  //   else document.body.classList.remove('dark');

  },[isDarkMode])

  const handleNavigation = (category) => {
    const currentParams = new URLSearchParams(window.location.search);
    if(category === 'All') currentParams.delete("category");
    else currentParams.set("category", category);
    currentParams.delete("cursor");
    currentParams.delete("search");

    const newSearchParams = currentParams.toString();
    const newPathname = `${window.location.pathname}?${newSearchParams}`;
    // TODO: Change states in parent component to the new category and pageInfo ...
    router.push(newPathname);
  };
  useEffect(() => {
    handleNavigation(selectedCategory);

  },[selectedCategory])

  // if(isLoading)
  //   return (
  //     <div className="w-full h-full px-[63px] pt-[426px] pb-[95.82px] bg-white flex-col justify-end items-center gap-[291px] inline-flex">
  //     <div className="text-black text-[64px] font-bold">Gear Up</div>
  //     <div className="flex justify-between w-full ">
  //       <Image width={60} height={60} className="w-[58px] h-[29.59px] " alt={generalAlt} src="/image 3.png" />
  //       <Image width={60} height={60} className="w-[58px] h-[39.18px] " alt={generalAlt} src="/Logo.svg" />
  //       <Image width={60} height={60} className="w-[58px] h-[29.59px] " alt={generalAlt} src="/image 9.png" />
  //     </div>
  //   </div>
  //   );
  return (
    <div className="w-full h-full gap-20 relative bg-white flex-col justify-start items-center py-10 inline-flex overflow-y-scroll">
      <div className="w-full flex flex-col justify-center items-center relative bg-gray-100 rounded-[20px] ">
        <Image width={300} height={334} className="w-[333px] h-[250px] rounded-[20px] object-cover " src="/gear_up_banner_1.jpg" alt="gear up"/>
        {/* <Image width={333} height={364} src="/Banner.png" alt="gear up"/> */}
        <div className=" text-neutral-700 text-xl font-bold m-2 mb-0 ">Designed for You.</div>
        <div className=" text-neutral-700 text-sm font-thin m-2 mt-0 ">An excellent choice for those who want convenience and comfort while playing sports</div>
        <div className="w-full flex flex-col justify-center items-center fontColor pt-4 ">
          <div className="flex items-center ">
            <a className="w-[60px] flex justify-center " href="https://wa.me/+96176021231" target="_blank">
              <svg
                fill="#008000"
                width="30px"
                height="30px"
                viewBox="-0.075 -0.075 0.9 0.9"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMinYMin"
                className="jam jam-whatsapp"
              >
                <path d="M0.357 0C0.158 0.01 0.001 0.174 0.001 0.372a0.367 0.367 0 0 0 0.041 0.167L0.002 0.731a0.015 0.015 0 0 0 0.018 0.017l0.189 -0.044a0.374 0.374 0 0 0 0.161 0.039c0.204 0.003 0.373 -0.157 0.379 -0.359C0.756 0.167 0.576 -0.01 0.357 0zm0.225 0.576a0.292 0.292 0 0 1 -0.207 0.085 0.291 0.291 0 0 1 -0.13 -0.03l-0.026 -0.013 -0.116 0.027 0.024 -0.117 -0.013 -0.025A0.286 0.286 0 0 1 0.082 0.371c0 -0.078 0.03 -0.151 0.086 -0.206a0.294 0.294 0 0 1 0.207 -0.085c0.078 0 0.152 0.03 0.207 0.085a0.288 0.288 0 0 1 0.086 0.206c0 0.077 -0.031 0.151 -0.086 0.206z" />
                <path d="m0.557 0.452 -0.072 -0.021a0.027 0.027 0 0 0 -0.027 0.007l-0.018 0.018a0.027 0.027 0 0 1 -0.029 0.006c-0.034 -0.014 -0.106 -0.077 -0.125 -0.109a0.026 0.026 0 0 1 0.002 -0.029l0.015 -0.02a0.027 0.027 0 0 0 0.003 -0.027L0.277 0.208a0.027 0.027 0 0 0 -0.042 -0.01c-0.02 0.017 -0.044 0.043 -0.047 0.071 -0.005 0.05 0.017 0.114 0.099 0.19 0.095 0.088 0.171 0.1 0.221 0.088 0.028 -0.007 0.051 -0.034 0.065 -0.056a0.027 0.027 0 0 0 -0.015 -0.04z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/gearr_up/" target="_blank">
              <div className="">
                <Image src="/Instagram-Logo.wine.svg" width="60" height="60" alt="instagram logo" />
              </div>
            </a>
          </div>
          <h1 className="fontColorGray ">contact us</h1>
        </div>
      </div>
      <div>
        <div className="w-full flex justify-center max-sm:items-center items-end  max-sm:gap-2 gap-4 mb-4 max-sm:flex-col fontColor">
          <div className="max-sm:mb-4">
            <label htmlFor="category" className="block text-lg font-semibold mb-2">
              Filter by Category
            </label>
            <select
              id="category"
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
            >
              <option value="All">All</option>
              {categoriesData.map((category, index) => (
                <option className="fontColor" href={`/categories/${category.slug}`} key={category.name} >{category.name}</option>
              ))}
            </select>
          </div>

          <SearchBar/>
        </div>
        <div className=" text-neutral-700 text-xl font-bold leading-normal ml-5">Items</div>
        <div className="w-full h-full flex items-start justify-between flex-wrap gap-4 p-4 relative">
          {productsState.map((item, index) => (
            <Link href={`/itemsDetails/${item.node.id}`} key={index} className="w-[108px] h-fit gap-0 p-2 rounded-md shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
              <Image 
                width={102} height={109.03} 
                className="w-[102px] h-[109.03px] left-0 top-0 rounded-[20px]" 
                alt={item.node.name} 
                src={ item.node.imageUrls[0].url} 
              />
              <div className="w-full text-neutral-700 text-sm font-bold leading-[18px]">{item.node.name.length > 15 ? item.node.name.slice(0, 11) + '...' : item.node.name}</div>
              <div className="w-full text-neutral-700 text-[10px] font-thin leading-[10px]">{item.node.Excerpt}</div>
            </Link>
          ))}
          {/* Pagination controls */}
          {isLoading && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">Loading...</div> }
          {!doesHaveNextPage && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">All Done! </div> }
          {/* Add an invisible element to act as the previousPostCardRef */}
          <div ref={lastProductCardRef} style={{ visibility: "hidden" }} />
        </div>
      </div>
      
    </div>
  )
}

export default StartPage