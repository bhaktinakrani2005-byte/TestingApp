import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDistinctCaseStatuses } from '../store/slice/ContactSlice';

export default function ChartDataPage() {
    const dispatch = useAppDispatch();
    const { caseStatuses } = useAppSelector((state) => state.contact);
    const [greeting, setGreeting] = useState('Good Afternoon');

    useEffect(() => {
        const now = new Date();
        console.log('current time is', now);
        const hour = now.getHours();
        if (hour >= 12 && hour < 16) {
            setGreeting('Good Afternoon');
        } else if (hour >= 16 && hour < 24) {
            setGreeting('Good Evening');
        } else {
            setGreeting('Good Morning');
        }

        //dispatch(fetchDistinctCaseStatuses());
    }, []);

    return (
        <div className="w-full p-4 md:p-8">
            <div>
                <Card className="w-full bg-[url('https://picsum.photos/id/1/200/300')] bg-cover bg-center">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold textcwhite">Welcome John Doe</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-lg text-gray-700 text-white">
                            {greeting}
                        </div>

                        {/* <div className="mt-8 border-t pt-6">
                        <p className="text-gray-500 mb-2 font-medium">
                            View your chart data
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer auctor nunc a nunc auctor, a auctor nunc.
                        </p>
                    </div> */}
                    </CardContent>
                </Card>
            </div>
            <div className="mt-7 flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4 w-full h-full">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">View your chart data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-gray-500">
                                <div className="flex items-center justify-center">
                                    <Avatar size="lg" >
                                        <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                </div>
                                View your chart data
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">View your chart data2</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-gray-500">
                                <h1>Contact Cases</h1>

                                {caseStatuses.map((item, index) => (
                                    <div key={index}>
                                        <p>
                                            {item.status} = {item.count}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
