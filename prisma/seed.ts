import prisma from "@/lib/prisma";

const hostels = [
    {
        name: "Hostel 1",
        description: "Hostel 1 description",
        location: "Accra, Ghana",
        owner_id: "63",
        university: "University 1",
        verified: true,
        featured: true,
        distance_to_campus: "10km",
    },
    {
        name: "Hostel 2",
        description: "Hostel 2 description",
        location: "Accra, Ghana",
        owner_id: "2",
        university: "University 1",
        verified: true,
        featured: true,
        distance_to_campus: "13km",
    },
    {
        name: "Hostel 3",
        description: "Hostel 3 description",
        location: "Accra, Ghana",
        owner_id: "3",
        university: "University 1",
        verified: true,
        featured: true,
        distance_to_campus: "15km",
    },
    {
        name: "Hostel 4",
        description: "Hostel 4 description",
        location: "Accra, Ghana",
        owner_id: "4",
        university: "University 1",
        verified: true,
        featured: true,
        distance_to_campus: "17km",
    },
    {
        name: "Hostel 5",
        description: "Hostel 5 description",
        location: "Accra, Ghana",
        owner_id: "5",
        university: "University 1",
        verified: true,
        featured: true,
        distance_to_campus: "19km",
    },
];

const seed = async () => {
    const user = await prisma.user.create({
        data: {
            email: "jamal3@gmail.com",
            password: "pass9999",
            first_name: "Jamal",
            last_name: "Zok",
            role: "ADMIN",
            is_verified: true,
            is_active: true,
            emailVerified: new Date(),
        },
    });

    const hostel = await prisma.hostels.createMany({
        data: hostels,
    });

    // const hostel = await prisma.hostels.create({
    //     data: {
    //         name: "Hostel 1",
    //         description: "Hostel 1 description",
    //         location: "Hostel 1 location",
    //         owner_id: user.id,
    //         university: "University 1",
    //         verified: true,
    //         featured: true,
    //     }
    // })

    const room = await prisma.room.create({
        data: {
            type: "Single",
            price: 100000,
            capacity: 1,
            available: true,
            hostel_id: "1",
            images: {
                create: {
                    url: "https://unsplash.com/photos/a-group-of-people-sitting-on-the-side-of-a-building-jDXMQf3LPX8",
                    is_primary: true,
                },
            },
        },
    });

    const roomImage = await prisma.roomImages.createMany({
        data: [
            {
                room_id: room.id,
                url: "https://unsplash.com/photos/a-group-of-people-sitting-on-the-side-of-a-building-jDXMQf3LPX8",
                is_primary: true,
            },
        ],
    });

    const booking = await prisma.booking.create({
        data: {
            user_id: user.id,
            room_id: room.id,
            hostel_id: "1",
            check_in_date: new Date(),
            check_out_date: new Date(),
            status: "PENDING",
            payment_status: "PENDING",
            payment_method: "MOBILE_MONEY",
            amount: 100000,
        },
    });

    const university = await prisma.university.create({
        data: {
            name: "Unversity of Cape Coast",
            location: "Cape Coast, Ghana",
        },
    });

    console.log(user, hostel, room, booking, university, roomImage);
};

seed()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
