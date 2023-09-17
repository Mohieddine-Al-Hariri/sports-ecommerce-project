import { createCategory, publishCategory } from '@/lib';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 } from 'uuid';
import { SVGLoading } from '.';

export const ProductCard = ({ product, included, include }) => { //TODO: put in seperate component
  return (
    <div className="flex flex-col items-center gap-2 w-[70px] group">
      <label
        className={`relative cursor-pointer ${
          included
            ? "border-[#4bc0d9]"
            : "border-gray-300 group-hover:border-[#3ca8d0]"
        } border-2 rounded-[10px] transition duration-300`}
        htmlFor={`includeItem ${product.id}`}
      >
        <input
          className="hidden"
          type="checkbox"
          id={`includeItem ${product.id}`}
          name="includeItem"
          onChange={() => include(included, {id: product.id, imageUrls: product.imageUrls, name: product.name} )}
          checked={included}
        />
        <Image
          width={60}
          height={87}
          className="w-[60px] h-[87px] rounded-[10px] transition duration-300"
          src={product.imageUrls[0].url}
          alt={product.name}
        />
        <div
          className={`absolute -top-4 left-4 ${
            included ? "bg-[#4bc0d9] group-hover:bg-[#3ca8d0] text-gray-100 " : "bg-white text-gray-600"
          }  p-1 rounded-full shadow text-sm`}
        >
          {included ? "Included" : "Include"}
        </div>
      </label>
      <p className="text-center text-xs">{product.name}</p>
    </div>
  );
};

const CreateCategoryForm = ({ products, hasNextPage, hasPreviousPage, getOtherProducts, productsPageNumber, isFetching }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [show, setShow] = useState(true);
  
  const [includedProducts, setIncludedProducts] = useState([]);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isError, setIsError] = useState(false)

  const router = useRouter();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleShowChange = (event) => {
    setShow(event.target.checked);
  };

  const include = (isIncluded, product) => {
    if (!isIncluded)
      setIncludedProducts((prevIncluded) => [
        ...prevIncluded,
        product,
      ]); //when toggled to true
    else
      setIncludedProducts((prevIncluded) =>
        prevIncluded.filter((item) => item.id !== product.id)
      ); //when toggled false
  };

  const handleSubmit = async (event) => { //TODO: Fix category not showing after create
    event.preventDefault();
    setCreatingCategory(true);
    const slug = v4();
    const categoryDetails = {
      name, slug, show, description, products: includedProducts.map((product) => ({id: product.id})) 
    };
    const createdCategory = await createCategory(categoryDetails);
    await publishCategory(createdCategory.createCategory.id);
    setCreatingCategory(false);
    router.refresh();
    setName('');
    setDescription('');
  };

  return (
    <div className="max-w-md mx-auto bgColor fontColor rounded-lg shadow-lg p-6 mb-5 border-2 borderColor">
      <h1 className="text-2xl font-semibold mb-4">Create Category</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium fontColorGray ">
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            required
            className="mt-1 p-2 border rounded w-full colorScheme"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium fontColorGray ">
            Description:
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            className="mt-1 p-2 border rounded w-full colorScheme"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="show" className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show"
              checked={show}
              onChange={handleShowChange}
              className="h-4 w-4 text-[#4bc0d9] colorScheme"
            />
            <span className="text-sm font-medium fontColorGray">Show</span>
          </label>
        </div>
        <div className="flex flex-col gap-1 mb-4 ">
          Products
          <div className="border-2 borderColor rounded-lg p-2 pt-4 ">
            <div className="flex flex-wrap gap-2 ">
              {includedProducts.map((product) => {
                  return(
                    <ProductCard
                      key={`create Collection Form (included): ${product.id}`}
                      product={product}
                      include={include}
                      included={true}
                    />
                  )
                })}
            </div>
            {includedProducts.length > 0 && <div className="bgColorGray w-3/4 h-1 rounded-full mt-2 mb-4 "></div>}
            <div className="flex flex-wrap gap-2 ">
            {products.map((product) => {
              let isIncluded = false
              includedProducts.map(includedProduct => {if(includedProduct.id === product.node.id) isIncluded = true})
              if(includedProducts.length === 0 || !isIncluded){
                return(
                  <ProductCard
                    key={`create Collection Form (not included): ${product.node.id}`}
                    product={product.node}
                    include={include}
                    included={false}
                  />
                )
              }
            })}
            </div>
            <div className="flex items-center justify-center space-x-4 w-full">
              <button
                disabled={!hasPreviousPage ? true : isFetching }
                onClick={(e) => getOtherProducts(e, "before")}
                className={`${
                  !hasPreviousPage
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isFetching ? "bg-gray-300 text-gray-500 cursor-waiting" : "bg-[#4bc0d9] hover:bg-[#3ca8d0]"
                } text-white font-bold py-2 px-4 rounded-full focus:outline-none`}
              >
                &lt;
              </button>
              <span className="textColorGray font-semibold">Page {productsPageNumber}</span>
              <button
                disabled={!hasNextPage ? true : isFetching }
                onClick={(e) => getOtherProducts(e, "after")}
                className={`${
                  !hasNextPage
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isFetching ? "bg-gray-300 text-gray-500 cursor-waiting" : "bg-[#4bc0d9] hover:bg-[#3ca8d0]"
                } text-white font-bold py-2 px-4 rounded-full focus:outline-none`}
              >
                &gt;
              </button>
            </div>


          </div>
        </div>
        <button disabled={creatingCategory} type="submit" className="max-sm:mb-6 bg-[#4bc0d9] hover:bg-[#3ca8d0] text-white px-4 py-2 rounded w-full">
          {creatingCategory ? 
            <div className='flex gap-4 justify-center items-center '>
              <SVGLoading/>
            </div>
        : "Create Category"}
        </button>
      </form>
    </div>
  );
};

export default CreateCategoryForm;
