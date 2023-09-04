"use client"
import Image from "next/image";
import { useEffect, useRef, useState } from "react"
import SearchBar from "./SearchBar";
import { useIsVisible } from "./UseVisible";
import { addManyItemsToCart, getProducts, publishCart, publishItemAddedToCart, publishManyItemsAddedToCart } from "@/lib";
import { useRouter } from 'next/navigation';
import { ProductCard } from ".";


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

  // const generalAlt = "Gear Up - Sports";

  const addItemsToCart = async (localCart) => { 
  //Add items to cart in DB from localStorage since user logged in
    const cartId = user.cartId;
    const items = localCart.map((item) => ({
      quantity: item.quantity,
      total: item.total,
      variant: item.variant,
      product: {
        connect: {
          id: item.product.id
        }
      }
    }));
    const res = await addManyItemsToCart({cartId, items});
    await publishCart(cartId);
    await publishManyItemsAddedToCart(res.updateCart.orderItems);
    localStorage.removeItem("cart");
  }

  useEffect(() => {
    const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
    if(isDarkModeLocal) {
      document.body.classList.add('dark');
      setIsDarkMode(true);
    } 
    else {
      document.body.classList.remove('dark');
      setIsDarkMode(false);
    }
    const localCart = JSON.parse(localStorage.getItem("cart"));
    if(user && localCart){
      addItemsToCart(localCart);
    }
  }, []);

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
              className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500 colorScheme"
            >
              <option value="All">All</option>
              {categoriesData.map((category) => (
                <option className="fontColor" href={`/categories/${category.slug}`} key={category.name} >{category.name}</option>
              ))}
            </select>
          </div>

          <SearchBar/>
        </div>
        <div className=" text-neutral-700 fontColorGray text-xl font-bold leading-normal ml-5">Items</div>
        {/* <div className="w-full h-full flex items-start justify-between flex-wrap gap-4 p-4 relative "> */}
        <div className="w-full h-full flex items-start justify-between flex-wrap gap-1 p-4 relative ">
          {productsState.map(item => (
            <ProductCard key={item.node.id} id={item.node.id} name={item.node.name} excerpt={item.node.excerpt} imageUrl={item.node.imageUrls[0].url} reviews={item.node.reviews} />
          ))}
          {/* Pagination controls */}
          {isLoading && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">Loading...</div> }
          {!doesHaveNextPage && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">All Done! </div> }
          {/* Add an invisible element to act as the previousProductCardRef */}
          <div ref={lastProductCardRef} style={{ visibility: "hidden" }} />
        </div>
      </div>
      
    
  )
}
  
export default StartPage