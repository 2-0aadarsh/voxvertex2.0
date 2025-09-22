"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import SectionHeader from "../../common/SectionHeader";
import AddCertification from "./AddCertification";
import AwardItem from "./AwardItem";
import {
  useGetAwardsQuery,
  useCreateAwardMutation,
  useUpdateAwardMutation,
  useDeleteAwardMutation,
  selectAwards,
} from "../../../../../store/slices/awardsSlice";
import { useAppSelector } from "../../../../../store/hooks";

const AwardsAndCertifications = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [awards, setAwards] = useState([]);

  // Get awards data from Redux
  const {
    data: awardsData,
    isLoading: isLoadingAwards,
    error: awardsError,
  } = useGetAwardsQuery({});
  const [createAward, { isLoading: isCreating }] = useCreateAwardMutation();
  const [updateAward, { isLoading: isUpdating }] = useUpdateAwardMutation();
  const [deleteAward, { isLoading: isDeleting }] = useDeleteAwardMutation();

  // Update local state when Redux data changes
  useEffect(() => {
    if (awardsData?.data) {
      setAwards(awardsData.data);
    }
  }, [awardsData]);

  // Show error toast if there's an error
  useEffect(() => {
    if (awardsError) {
      toast.error("Failed to load awards data");
      console.error("Awards error:", awardsError);
    }
  }, [awardsError]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAward(null);
  };

  const handleEditAward = (awardId) => {
    console.log("✏️ Edit award:", awardId);
    // Find the award to edit
    const awardToEdit = awards.find((award) => award._id === awardId);
    if (awardToEdit) {
      console.log("📝 Award to edit:", awardToEdit);
      setEditingAward(awardToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteAward = async (awardId) => {
    console.log("🗑️ Delete award:", awardId);
    try {
      const result = await deleteAward(awardId).unwrap();
      if (result.success) {
        // Remove from local state
        setAwards((prev) => prev.filter((award) => award._id !== awardId));
        toast.success("Award deleted successfully");
      } else {
        throw new Error(result.message || "Failed to delete award");
      }
    } catch (error) {
      console.error("Error deleting award:", error);
      throw error; // Re-throw to let the item component handle the error
    }
  };

  // Helper function to get month number
  const getMonthNumber = (monthName) => {
    const months = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };
    return months[monthName] || "01";
  };

  // Helper function to format period
  const formatPeriod = (dateIssued) => {
    if (!dateIssued) return "N/A";
    const date = new Date(dateIssued);
    return `${date.getFullYear()}`;
  };

  const handleSaveAward = async (awardData) => {
    try {
      setIsLoading(true);

      console.log("Award data received from form:", awardData);

      // Format data for API
      const formattedData = {
        title: awardData.title,
        issuer: awardData.issuer,
        description: awardData.description || "",
        dateIssued: `${awardData.year}-${getMonthNumber(awardData.month)}-01`,
        credentialId: awardData.credentialId || "",
        credentialUrl: awardData.credentialUrl || "",
        type: awardData.type ? awardData.type.toLowerCase() : "certification", // Convert to lowercase for backend compatibility
        expiryDate: awardData.doesNotExpire ? null : undefined,
      };

      console.log("Formatted award data for API:", formattedData);

      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;

      // Create a temporary award object for optimistic UI update
      const tempAward = {
        _id: tempId,
        ...formattedData,
        period: formatPeriod(formattedData.dateIssued),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update the UI
      setAwards((prevAwards) => [tempAward, ...prevAwards]);

      // Call the API to create award
      console.log("Calling createAward API with:", formattedData);
      let result;
      try {
        result = await createAward(formattedData).unwrap();
        console.log("API response:", result);
      } catch (apiError) {
        console.error("API error details:", apiError);
        throw apiError;
      }

      if (result && result.success) {
        // Replace temporary award with real one from API
        setAwards((prevAwards) => {
          const filteredAwards = prevAwards.filter(
            (award) => award._id !== tempId
          );
          return [result.data, ...filteredAwards];
        });

        toast.success("Award/Certification added successfully!");
        handleCloseModal();
      } else {
        throw new Error(result?.message || "Failed to create award");
      }
    } catch (error) {
      console.error("Error saving award:", error);

      // Remove temporary award on error
      setAwards((prevAwards) =>
        prevAwards.filter((award) => !award._id.startsWith("temp-"))
      );

      // Show error message
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to save award/certification";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAward = async (awardData) => {
    try {
      setIsLoading(true);

      // Format data for API
      const formattedData = {
        title: awardData.title,
        issuer: awardData.issuer,
        description: awardData.description || "",
        dateIssued: new Date(
          `${awardData.year}-${getMonthNumber(awardData.month)}-01`
        ).toISOString(),
        credentialId: awardData.credentialId || "",
        credentialUrl: awardData.credentialUrl || "",
        type: awardData.type ? awardData.type.toLowerCase() : "certification", // Convert to lowercase for backend compatibility
        doesNotExpire: awardData.doesNotExpire,
      };

      console.log("🔄 Updating award:", editingAward._id, formattedData);

      // Call the API to update award
      const result = await updateAward({
        id: editingAward._id,
        updates: formattedData,
      }).unwrap();

      if (result.success) {
        // The Redux cache will automatically refetch and update the UI
        toast.success("Award updated successfully!");
        setIsEditModalOpen(false);
        setEditingAward(null);
      } else {
        toast.error(result.message || "Failed to update award");
      }
    } catch (error) {
      console.error("Error updating award:", error);
      toast.error(error.message || "Failed to update award");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoadingAwards) {
    return (
      <section className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px]">
        <div className="w-[90%] mx-auto">
          <SectionHeader
            id="awardsAndCertifications"
            title="Awards & Certifications"
            onAddClick={handleOpenModal}
          />
          <div className="space-y-2 my-12 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b border-orange-100"
              >
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-[1154px] bg-[#ffffff] py-4 shadow-md rounded-[13.01px]">
        <div className="w-[90%] mx-auto">
          <SectionHeader
            id="awardsAndCertifications"
            title="Awards & Certifications"
            onAddClick={handleOpenModal}
          />

          <div className="space-y-2 my-12">
            {awards.length > 0 ? (
              awards.map((award, index) => (
                <AwardItem
                  key={award._id || index}
                  id={award._id}
                  title={award.title}
                  description={award.description || award.issuer}
                  period={award.period || formatPeriod(award.dateIssued)}
                  onEdit={handleEditAward}
                  onDelete={handleDeleteAward}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No awards or certifications added yet.</p>
                <p className="text-sm mt-1">
                  Click the "+" button to add your first one!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Add Award Modal */}
      <AddCertification
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAward}
        isLoading={isLoading || isCreating}
      />

      {/* Edit Award Modal */}
      <AddCertification
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleUpdateAward}
        isLoading={isLoading || isUpdating}
        editingAward={editingAward}
        isEditMode={true}
      />
    </>
  );
};

export default AwardsAndCertifications;
