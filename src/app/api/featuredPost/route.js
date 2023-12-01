import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

// GET SINGLE POST
export const GET = async () => {
  //   const { slug } = params;

  try {
    const post = await prisma.post.findFirst({
      where: {
        title: "This is CISCO, we SECURE your CONNECT!!",
        catSlug: "coding",
        userEmail: "mishrishav@gmail.com",
      },
    });

    return new NextResponse(JSON.stringify(post, { status: 200 }));
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
};
