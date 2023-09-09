"use client"
import Image from "next/image";
import { useEffect, useRef, useState } from "react"
import SearchBar from "./SearchBar";
import { useIsVisible } from "./UseVisible";
import { addManyItemsToCart, getProducts, publishCart, publishItemAddedToCart, publishManyItemsAddedToCart } from "@/lib";
import { useRouter } from 'next/navigation';
import { ProductCard } from ".";

export const LoadingCard = () => {
  return (
    <div className={`relative hover:scale-[1.1] duration-200 shadow-lg overflow-hidden rounded-lg h-[200px] w-full sm:w-1/2 md:w-1/3 lg:w-1/4 bgColorTransition transition-all`}>
      <div className='absolute bottom-0 left-0 px-4 py-2 w-full'>
        <h1 className=" bg-white rounded-full w-1/2 h-4 mb-2"></h1>
        <h1 className=" bg-white rounded-full w-3/4 h-4"></h1>
      </div>
    </div>
  )
}
const StartPage = ({ products, hasNextPage, user, searchText, categoriesData, searchedCategory, collectionsData }) => {
  const [productsState, setProductsState] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  //Pagination
  const [lastProductCursor, setLastProductCursor] = useState(products ? products[products?.length - 1]?.cursor : "");
  const [doesHaveNextPage, setDoesHaveNextPage] = useState(hasNextPage);
  const lastProductCardRef = useRef();
  const isLastProductCardVisible = useIsVisible(lastProductCardRef);
  const [isFirstRedner, setIsFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchedCategory || 'All');

  const router = useRouter();

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
    const searchedCategory = undefined;
    //TODO: create an env var specific for this pagination...
    const paginatedProducts = await getProducts(lastProductCursor, searchText, searchedCategory);
    return paginatedProducts;
  }
  useEffect(() => {
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
    router.push(newPathname);
  };
  useEffect(() => {
    handleNavigation(selectedCategory);
  },[selectedCategory])

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
                <option className="fontColor" >Collections & Sales</option>
            </select>
          </div>

          <SearchBar/>
        </div>
        <div className=" text-neutral-700 fontColorGray text-xl font-bold leading-normal ml-5">Items</div>
        <div className="w-full h-full flex items-start justify-around lg:justify-between flex-wrap gap-1 p-4 relative ">
          {selectedCategory === 'Collections & Sales' ?
            collectionsData?.collections.map(collection => {
              const images = collection.node.products?.map(product => product.imageUrls[0]);
              return(
                <ProductCard key={collection.node.id} id={collection.node.id} name={collection.node.name} excerpt={collection.node.decription} imageUrl={collection.node.imageUrl} imageUrls={images} isCollection={true} />
              )
            })
          :
            collectionsData?.collections.slice(0, 4).map(collection => {
              const images = collection.node.products?.map(product => product.imageUrls[0]);
              return(
                <ProductCard key={collection.node.id} id={collection.node.id} name={collection.node.name} excerpt={collection.node.decription} imageUrl={collection.node.imageUrl} imageUrls={images} isCollection={true} />
              )
            })
          }
          {productsState?.map(item => (
            <ProductCard key={item.node.id} id={item.node.id} name={item.node.name} excerpt={item.node.excerpt} imageUrl={item.node.imageUrls[0].url} reviews={item.node.reviews} />
          ))}
          {/* Pagination controls */}
          {isLoading && 
            <>
              <LoadingCard/>
              <LoadingCard/>
              <LoadingCard/>
            </>
          }
          {!doesHaveNextPage && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">All Done! </div> }
          {/* Add an invisible element to act as the previousProductCardRef */}
          <div className="w-full h-[60px]" ref={lastProductCardRef} style={{ visibility: "hidden" }} />
        </div>
      </div>
      
    
  )
}
  
export default StartPage