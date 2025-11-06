import React, { useState, useEffect, useCallback } from 'react';
import { User, ServiceRequest, Offer } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { MegaphoneIcon, MapPinIcon } from './icons';
import { MakeOfferModal } from './MakeOfferModal';
import { ReviewModal } from './ReviewModal';
import toast from 'react-hot-toast';
import { ConfirmModal } from './ConfirmModal';
import { GoogleMap } from './GoogleMap';
import { getCurrencySymbol } from '../utils/currency';
import { Link } from 'react-router-dom';

interface ServiceRequestViewScreenProps {
  requestId: string;
  usersMap: Map<string, User>;
  currentUser: User;
  onBack: () => void;
}

const ServiceRequestViewScreen: React.FC<ServiceRequestViewScreenProps> = ({ requestId, usersMap, currentUser, onBack }) => {
    const [request, setRequest] = useState<ServiceRequest | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ action: () => Promise<void>; title: string; description: string; confirmText: string; isDestructive?: boolean } | null>(null);

    const fetchRequestDetails = useCallback(() => {
        setIsLoading(true);
        Promise.all([
            api.getServiceRequestById(requestId),
            api.getOffersForRequest(requestId),
            api.hasUserReviewed(requestId, currentUser.id)
        ]).then(([req, offersData, reviewed]) => {
            setRequest(req);
            setOffers(offersData);
            setHasReviewed(reviewed);
            setIsLoading(false);
        }).catch(() => {
            toast.error("Failed to load request details.");
            setIsLoading(false);
        });
    }, [requestId, currentUser.id]);

    useEffect(() => {
        fetchRequestDetails();
    }, [fetchRequestDetails]);

    const handleOfferSubmit = () => {
        toast.success('Offer submitted!');
        fetchRequestDetails();
    };

    const handleAcceptOffer = async (offerId: string) => {
        const success = await api.acceptOffer(offerId);
        if (success) {
            toast.success('Offer accepted!');
            fetchRequestDetails();
        } else {
            toast.error('Failed to accept offer. Check your balance.');
        }
        setConfirmAction(null);
    };
    
    const handleMarkComplete = async () => {
        if (!request) return;
        const updatedRequest = await api.markJobComplete(request.id, currentUser.id);
        if(updatedRequest) {
            toast.success("Job marked as complete. Awaiting client confirmation.");
            fetchRequestDetails();
        } else {
            toast.error("Failed to mark job as complete.");
        }
        setConfirmAction(null);
    };
    
    const handleConfirmCompletion = async () => {
        if (!request) return;
        const transaction = await api.confirmCompletionAndPay(request.id, currentUser.id);
        if(transaction) {
            toast.success("Payment released successfully!");
            fetchRequestDetails();
        } else {
            toast.error("Failed to confirm completion.");
        }
        setConfirmAction(null);
    };
    
    const handleReviewSubmit = () => {
        toast.success("Review submitted!");
        fetchRequestDetails();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-gray-950">
                <Header title="Loading Request..." onBack={onBack} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }
    
    if (!request) {
         return (
            <div className="flex flex-col h-screen bg-gray-950">
                <Header title="Request Not Found" onBack={onBack} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-400">Could not find this service request.</p>
                </div>
            </div>
        );
    }
    
    const client = usersMap.get(request.clientId);
    const isClient = currentUser.id === client?.id;
    const hiredOffer = request.hiredOfferId ? offers.find(o => o.id === request.hiredOfferId) : null;
    const hiredProvider = hiredOffer ? usersMap.get(hiredOffer.providerId) : null;
    const isProvider = currentUser.serviceProviderProfileId !== undefined;
    const hasMadeOffer = offers.some(o => o.providerId === currentUser.id);
    const canMakeOffer = isProvider && !isClient && request.status === 'Open' && !hasMadeOffer;
    const canReview = (isClient && hiredProvider && !hasReviewed) || (!isClient && hiredProvider?.id === currentUser.id && !hasReviewed);
    const userToReview = isClient ? hiredProvider : client;


    return (
        <>
            {isProvider && <MakeOfferModal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} serviceRequestId={request.id} providerId={currentUser.id} onSubmit={handleOfferSubmit} />}
            {confirmAction && <ConfirmModal isOpen={true} onClose={() => setConfirmAction(null)} onConfirm={confirmAction.action} title={confirmAction.title} description={confirmAction.description} confirmText={confirmAction.confirmText} isDestructive={confirmAction.isDestructive} />}
            {isReviewModalOpen && userToReview && <ReviewModal isOpen={true} onClose={() => setIsReviewModalOpen(false)} serviceRequest={request} currentUser={currentUser} userToReview={userToReview} onSubmit={handleReviewSubmit} />}

            <div className="flex flex-col h-screen bg-gray-950 text-white">
                <Header title="Service Request" onBack={onBack} />
                <main className="flex-1 overflow-y-auto pb-24">
                    <div className="p-4 bg-gray-900 border-b border-white/10">
                        <p className="font-semibold text-brandGreen-400">{request.category}</p>
                        <h1 className="text-2xl font-bold text-white mt-1">{request.title}</h1>
                        <p className="text-gray-200 mt-1 font-semibold">{request.budget || 'Inquire'}</p>
                    </div>

                    <div className="p-4 space-y-6">
                        <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
                            <h2 className="font-semibold mb-2">Details</h2>
                            <p className="text-gray-300 whitespace-pre-wrap">{request.description}</p>
                        </div>
                         {request.location && (
                            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
                                <h2 className="font-semibold mb-2">Location</h2>
                                <div className="h-40 rounded-lg overflow-hidden">
                                    <GoogleMap center={{ lat: request.location.latitude, lng: request.location.longitude }} zoom={15} markers={[{ id: request.id, lat: request.location.latitude, lng: request.location.longitude }]} />
                                </div>
                                <div className="flex items-start gap-2 text-gray-300 mt-2">
                                    <MapPinIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{request.location.address}</span>
                                </div>
                            </div>
                        )}
                        <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
                             <h2 className="font-semibold mb-2">Posted By</h2>
                             {client && (
                                <Link to={`/profile/view/${client.id}`} className="flex items-center gap-3">
                                    <Avatar user={client} />
                                    <div>
                                        <p className="font-semibold text-white">{client.name}</p>
                                        <p className="text-xs text-gray-500">View Profile</p>
                                    </div>
                                </Link>
                             )}
                        </div>

                         <div className="bg-gray-800/50 border border-white/10 rounded-xl p-4">
                            <h2 className="font-semibold mb-3">Offers ({offers.length})</h2>
                            {offers.length > 0 ? (
                                <div className="space-y-3">
                                    {offers.map(offer => {
                                        const provider = usersMap.get(offer.providerId);
                                        return (
                                            <div key={offer.id} className="bg-gray-700/50 p-3 rounded-lg border border-white/10">
                                                 {provider && (
                                                     <div className="flex items-center justify-between">
                                                        <Link to={`/service-provider/${provider.serviceProviderProfileId}`} className="flex items-center gap-3">
                                                            <Avatar user={provider} size="sm"/>
                                                            <div>
                                                                <p className="font-semibold text-white">{provider.name}</p>
                                                                <p className="text-sm font-bold text-brandGreen-400">{getCurrencySymbol('BDT')}{offer.price.toLocaleString()}</p>
                                                            </div>
                                                        </Link>
                                                        {isClient && request.status === 'Open' && (
                                                            <button onClick={() => setConfirmAction({ action: () => handleAcceptOffer(offer.id), title: 'Accept Offer?', description: `Are you sure you want to accept this offer for BDT ${offer.price.toLocaleString()}? This amount will be held in escrow.`, confirmText: 'Accept & Escrow' })} className="bg-brandGreen-600 text-white font-bold py-1 px-3 rounded-md text-sm">Accept</button>
                                                        )}
                                                    </div>
                                                 )}
                                                 {offer.message && <p className="text-sm text-gray-300 mt-2 pt-2 border-t border-white/10 italic">"{offer.message}"</p>}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : <p className="text-sm text-gray-400">No offers yet.</p>}
                        </div>
                    </div>
                </main>
                <footer className="sticky bottom-0 bg-gray-950/80 backdrop-blur-xl border-t border-white/10 p-4">
                    {canMakeOffer && <button onClick={() => setIsOfferModalOpen(true)} className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"><MegaphoneIcon className="h-5 w-5" /> Make an Offer</button>}
                    {isClient && request.providerCompletedTimestamp && !request.clientConfirmedCompletionTimestamp && <button onClick={() => setConfirmAction({ action: handleConfirmCompletion, title: 'Confirm Completion?', description: `Are you sure you want to confirm completion and release payment of BDT ${hiredOffer?.price.toLocaleString()} to ${hiredProvider?.name}?`, confirmText: 'Confirm & Pay' })} className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg">Confirm Completion & Pay</button>}
                    {!isClient && hiredProvider?.id === currentUser.id && request.status === 'InProgress' && !request.providerCompletedTimestamp && <button onClick={() => setConfirmAction({ action: handleMarkComplete, title: 'Mark as Complete?', description: 'Are you sure you have completed this job? The client will be notified to confirm.', confirmText: 'Mark Complete' })} className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg">Mark as Complete</button>}
                    {request.status === 'Completed' && canReview && <button onClick={() => setIsReviewModalOpen(true)} className="w-full bg-yellow-600 text-white font-bold py-3 rounded-lg">Leave a Review</button>}
                </footer>
            </div>
        </>
    );
};

export default ServiceRequestViewScreen;
