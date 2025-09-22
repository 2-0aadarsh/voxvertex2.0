/* eslint-disable react/prop-types */
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic imports for CalendarBody sub-components
const CalendarControls = dynamic(() => import("./CalendarControls"), {
  loading: () => <div className="h-12 bg-gray-100 animate-pulse rounded"></div>,
  ssr: false,
});

const WeekDays = dynamic(() => import("./WeekDays"), {
  loading: () => <div className="h-8 bg-gray-100 animate-pulse rounded"></div>,
  ssr: false,
});

const DatesGrid = dynamic(() => import("./DatesGrid"), {
  loading: () => (
    <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
  ),
  ssr: false,
});

const CalendarBody = ({
  currentMonth,
  selectedDate,
  setSelectedDate,
  monthStart,
  startDate,
  endDate,
  handlePrev,
  handleNext,
}) => {
  return (
    <div className="flex flex-col gap-3 bg-[#FFF9F7] border border-[#FF6B35]/50 rounded-2xl p-6">
      <Suspense
        fallback={
          <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
        }
      >
        <CalendarControls
          currentMonth={currentMonth}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      </Suspense>

      <Suspense
        fallback={<div className="h-8 bg-gray-100 animate-pulse rounded"></div>}
      >
        <WeekDays startDate={startDate} />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
        }
      >
        <DatesGrid
          startDate={startDate}
          endDate={endDate}
          monthStart={monthStart}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </Suspense>
    </div>
  );
};

export default CalendarBody;
