import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
    },
  });

  const {
    productId,
    name,
    imageUrls,
    removedImagesIds,
    excerpt,
    description,
    price,
    state,
    variants,
    previousCategories,
    previousVariants,
    categories,
  } = body;

  let variantInput = [];
  if (variants.length > 0) {
    variantInput = 
      variants.map((variant) => {
        const variantInput = {};
        if (variant.size) {
          variantInput.name = variant.size;
        }
        if (variant.color) {
          variantInput.name = variant.color;
        }
        if(variant.quantity !== null) variantInput.quantity = variant.quantity;
        return variantInput;
      });
  }

  const query = `
    mutation updateProduct(
      $productId: ID!
      $name: String!
      $imageUrls: [ImageUrlCreateInput!]
      $removedImagesIds: [ImageUrlWhereUniqueInput!]
      $excerpt: String!
      $description: String!
      $price: Float!
      $state: ProductStates!
      $previousVariants: [ProductVariantWhereUniqueInput!]
      $variants: [ProductVariantCreateInput!]
      $previousCategories: [CategoryWhereUniqueInput!]
      $categories: [CategoryConnectInput!]
    ) {
      updateProduct(
        where: {id: $productId}
        data: {
          name: $name, 
          imageUrls: {create: $imageUrls, delete: $removedImagesIds }, 
          excerpt: $excerpt, 
          description: $description, 
          price: $price, 
          state: $state, 
          productVariants: {delete: $previousVariants, create: $variants}, 
          categories: {disconnect: $previousCategories, connect: $categories},
        }
      ) {
        id
        imageUrls{
          id
        }
        productVariants{
          id
        }
      }
    }
  `;

  try {
    //TODO: add collection for later...
    const updatedProduct = await client.request( 
      query,
      {
        productId,
        name,
        imageUrls,
        removedImagesIds: removedImagesIds.map(id => ({id})),
        excerpt,
        description,
        price,
        state,
        variants: variantInput,
        previousVariants,
        previousCategories,
        categories: categories.map((category) => ({where: { id: category }})),
      }
    );
    // $previousCollections: [ID!]!, 
    // $collections: [CollectionWhereUniqueInput!]!
    // collections: {disconnect: {id: $previousCollections}, connect: {where: {id: $collections}}}}
    // console.log("__________________________updatedProduct: \n", updatedProduct);

    return new Response(JSON.stringify(updatedProduct)); // Should return the post's title
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({ status: 500, body: error.message });
  }
}
