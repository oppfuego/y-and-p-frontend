import {NextResponse} from "next/server";

export async function POST(request: Request) {
    const {password} = await request.json();

    if (password === process.env.ADMIN_PASSWORD) {
        return NextResponse.json({message: 'Login successful'});
    }
    return NextResponse.json({message: 'Invalid password'}, {status: 401});
}