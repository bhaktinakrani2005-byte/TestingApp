//import React from 'react';

export default function ContactDetailSkeleton() {
    return (
        <div className="p-4 md:p-8 space-y-8 flex-1 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
                <div className="flex gap-2">
                    <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
                    <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
                </div>
            </div>

            {/* Grid for Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info Card Skeleton */}
                <div className="bg-white border border-gray-150 rounded-2xl p-6 space-y-6">
                    <div className="h-6 w-40 bg-gray-250 rounded mb-4"></div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                            <div className="h-5 w-48 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                            <div className="h-5 w-56 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                            <div className="h-5 w-36 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Account Info Card Skeleton */}
                <div className="bg-white border border-gray-150 rounded-2xl p-6 space-y-6">
                    <div className="h-6 w-40 bg-gray-250 rounded mb-4"></div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            <div className="h-5 w-52 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-gray-200 rounded"></div>
                            <div className="h-5 w-32 bg-gray-200 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                            <div className="h-5 w-40 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Cases Skeleton */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6">
                <div className="h-6 w-36 bg-gray-250 rounded mb-6"></div>
                <div className="space-y-4">
                    {/* Table Header placeholder */}
                    <div className="flex border-b border-gray-100 pb-3">
                        <div className="h-4 w-1/4 bg-gray-250 rounded mr-2"></div>
                        <div className="h-4 w-2/4 bg-gray-250 rounded mr-2"></div>
                        <div className="h-4 w-1/8 bg-gray-250 rounded mr-2"></div>
                        <div className="h-4 w-1/8 bg-gray-250 rounded"></div>
                    </div>
                    {/* Table Rows placeholder */}
                    <div className="flex py-2 border-b border-gray-50">
                        <div className="h-4 w-1/4 bg-gray-200 rounded mr-2"></div>
                        <div className="h-4 w-2/4 bg-gray-200 rounded mr-2"></div>
                        <div className="h-4 w-1/8 bg-gray-200 rounded mr-2"></div>
                        <div className="h-4 w-1/8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex py-2 border-b border-gray-50">
                        <div className="h-4 w-1/4 bg-gray-200 rounded mr-2"></div>
                        <div className="h-4 w-2/4 bg-gray-200 rounded mr-2"></div>
                        <div className="h-4 w-1/8 bg-gray-200 rounded mr-2"></div>
                        <div className="h-4 w-1/8 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
