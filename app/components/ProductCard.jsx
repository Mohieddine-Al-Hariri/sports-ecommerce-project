"use client"
import Image from 'next/image'
import Link from 'next/link'
import ReactStars from 'react-rating-star-with-type';

const ProductCard = ({ id, name, excerpt, imageUrl, reviews }) => {
  const rates = reviews?.map(review => review.rating)
  const rate = rates?.reduce((a, b) => a + b, 0) / rates?.length;
  return (
    <Link href={`/itemsDetails/${id}`} className="relative shadow-lg overflow-hidden rounded-lg h-[200px] w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
      <Image width={100} height={100} className="h-full w-full object-cover" alt={name} src={imageUrl}/>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
      <div className='absolute bottom-0 left-0 px-4 py-2 '>
        <h1 className="text-white ">{name.length > 17 ? name.slice(0, 15) + '...' : name}</h1>
        {excerpt && <h2 className=" text-gray-300 text-xs  ">{excerpt.length > 20 ? excerpt.slice(0, 18) + '...' : excerpt}</h2>}
        {reviews && reviews.length > 0 &&
          <ReactStars
            count={5}
            value={rate}
            size={16}
            isHalf={true}
            activeColors={[ "red", "orange", "#FFCE00", "#FFCE00","#4bc0d9",]}
            className='absolute bottom-0 right-0'
          />  
        }
      </div>
    </Link>
  )
}

export default ProductCard