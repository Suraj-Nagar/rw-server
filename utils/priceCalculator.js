export const calculatePrice=(pricePerMonth,checkInDate,checkOutDate)=>{
    const checkIn=new Date(checkInDate);
    const checkOut=new Date(checkOutDate);
    const yearDiff=checkOut.getFullYear()-checkIn.getFullYear();
    const monthDiff=checkOut.getMonth()-checkIn.getMonth();
    let totalMonths=yearDiff*12+monthDiff;
    if(totalMonths<=0) totalMonths=1;
    return pricePerMonth*totalMonths;
};