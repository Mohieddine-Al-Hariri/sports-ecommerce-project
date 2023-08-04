import { GraphQLClient } from "graphql-request";

export async function POST(req) {
  const body = await req.json();
  const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT, {
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN}`,
    },
  });
  const { itemId, userSlug } = body;
  try {
    const isItemAdded = await client.request(
      `
      mutation UpdateTheUser($itemId: ID!, $userSlug: String!) {
        updateTheUser(
            where: {slug: $userSlug}
            data: {orderItems: {connect: {where: {id: $itemId}}}}
        ) {
          id
        }
      }
      
      `,
      { itemId, userSlug }
    );
    
    return new Response(JSON.stringify(isItemAdded)); // Should return the id
    // res.status(201).json(newComment.createComment);
  } catch (error) {
    console.error("Error in POST:", error);
    return new Response({status:500, body: error.message});
  }

  // res.status(405).json({ message: 'Method not allowed.' });
}
