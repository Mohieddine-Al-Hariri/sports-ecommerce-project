import { createCollection, publishCollection } from "@/lib";
import { storage } from "@/lib/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { v4 } from "uuid";

export const ProductCard = ({ product, included, include }) => {
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
}; //TODO: put in seperate component

const CreateCollectionForm = ({ products, getOtherProducts, productsPageNumber, isFetching, hasNextPage, hasPreviousPage, uploadImage }) => {

  const [form, setForm] = useState({
    name: "",
    description: "",
    state: "Available",
    products: [],
    price: 0,
    imageUrl: ""
  })
  const [numericPrice, setNumericPrice] = useState(null);
  // const [imageError, setImageError] = useState(false); //TODO: remove OR use it instead of the alert
  const [imageUpload, setImageUpload] = useState(null);
  const [includedProducts, setIncludedProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false)
  const router = useRouter();
  const handlePriceChange = (e) => {
    const newValue = e.target.value;
    setForm({ ...form, price: newValue });
  
    // Check if the input can be parsed as a number, and update numericPrice accordingly.
    const parsedValue = parseFloat(newValue.replace('$', '').trim());
    setNumericPrice(isNaN(parsedValue) ? null : parsedValue);
  };
  

  // const uploadImage = async (imagePath) => { //TODO: Get func from Parent, Fix if didnt work
  //   //To add the new profile image to the database
  //   if (imagePath == null || !imagePath) {
  //     return imageUrl;
  //   }
  //   const imageRef = ref(storage, `profileImages/${imagePath.name + v4()}`);
  //   const imageUrl = await uploadBytes(imageRef, imagePath).then(
  //     async (snapshot) => {
  //       const downloadUrl = await getDownloadURL(snapshot.ref).then((url) => {
  //         return url;
  //       });
  //       return downloadUrl;
  //     }
  //   );
  //   return imageUrl;
  // };
  const handleChangeImage = (e) => {
    e.preventDefault();

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.includes('image')) {
      alert('Please upload an image!');

      return;
    }
    setImageUpload(file);

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      const result = reader.result;

      // handleStateChange("image", result)
      setForm({ ...form, imageUrl: result });
    };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!numericPrice || !form.name ) {
      setIsError(true);
      function timeout() {
        setIsError(false);
      }
      setTimeout(timeout, 3000);
      return;
    }
    setIsSaving(true);
    const imageUrl = imageUpload ? await uploadImage(imageUpload) : null;
    const slug = form.name.replace(/\s+/g, '-').toLowerCase() + v4();
    const createdCollection = await createCollection({
      ...form,
      price: numericPrice,
      imageUrl,
      slug,
      products: includedProducts.map((product) => ({id: product.id}))
    })
    await publishCollection(createdCollection.createCollection.id);
    router.refresh();
    setIsSaving(false);
    setForm({
      name: "",
      description: "",
      state: "Available",
      products: [],
      price: 0
    })
    setNumericPrice(null);
    setImageUpload(null);
    setIncludedProducts([]);
  }
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
    // setIsIncluded(!isIncluded);
  };

  
  return (
    <div className="flex flex-col pb-4">
      <h2 className="text-xl font-semibold mb-4 mt-5">Create a Collection</h2>
      <form className="flex flex-col space-y-4 colorScheme fontColor">
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg py-2 px-3"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded-lg py-2 px-3"
          />
        </div>
        <div className="md:flex gap-2 justify-evenly items-end max-md:space-y-4 grow">
          <div className="flex flex-col w-full">
            <label htmlFor="state" className="text-sm font-medium">State</label>
            <select
              id="state"
              name="state"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="border rounded-lg py-2 px-3"
            >
              <option value="Available">Available</option>
              <option value="Out_of_Stock">Out of Stock</option>
              <option value="Removed">Removed</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="price" className="text-sm font-medium">Price</label>
            <input
              type="text"
              id="price"
              name="price"
              value={`$${numericPrice !== null ? numericPrice : ''}`}
              onChange={handlePriceChange}
              className="border rounded-lg py-2 px-3"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1  ">
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
        <div className="flexCenter flex-col  lg:min-h-[200px] min-h-[100px] relative w-full py-16">
          {!imageUpload && (
            <label htmlFor="poster" className="flexCenter z-10 text-center w-full h-[300px] p-20 dashedBorder rounded-lg aspect-square fontColor absolute">
              Choose an Image <br /> (Optional)
            </label>
          )}
          <div className="flexCenter bg-gray-500 rounded-lg aspect-square overflow-hidden w-full sm:w-1/2 md:w-1/3 lg:w-1/4 h-[200px] ">
            <input
              id="poster"
              type="file"
              accept="image/*"
              className="form_image-input lg:max-h-[300px] lg:mt-5 "
              onChange={(e) => handleChangeImage(e)}
            />
            {form.imageUrl && (
              <Image
                src={form.imageUrl}
                className=" object-cover z-20 w-full h-full rounded-lg "
                alt="image"
                // fill
                width={100}
                height={100}
              />
              
            )}
          </div>
            {imageUpload?.name.slice(0, 20)}...
        </div>
        {isError && <p className="text-red-500 w-full text-center">Please fill out all fields</p>}
        <button
          disabled={isSaving}
          onClick={handleSubmit}
          className="bg-[#4bc0d9] hover:bg-[#3ca8d0] text-white font-semibold py-2 rounded-lg transition-colors duration-300"
        >
          {isSaving ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>

  )
}

export default CreateCollectionForm