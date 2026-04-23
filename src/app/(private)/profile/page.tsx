"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Upload, Camera, LogOut, Eye, EyeOff, Lock } from "lucide-react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { toast } from "sonner";

import {
  fetchWithAuth,
  extractApiData,
  getApiErrorMessage,
} from "@/lib/apiClient";
import { getClientAuth } from "@/lib/firebaseClient";

type ProfileData = {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  address: string;
};

type ProfileRecord = {
  email: string | null;
  name: string | null;
  photoURL: string | null;
  profileImageUrl: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string | null;
};

const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const DEFAULT_PROFILE: ProfileData = {
  name: "",
  email: "",
  countryCode: "+1",
  phone: "",
  address: "",
};

function splitPhone(value: string | null | undefined) {
  if (!value) {
    return { countryCode: "+1", phone: "" };
  }

  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^(\+\d+)\s*(.*)$/);

  if (match) {
    return { countryCode: match[1], phone: match[2].trim() };
  }

  return { countryCode: "+1", phone: trimmedValue };
}

export default function ProfilePage() {
  const router = useRouter();
  const photoInputId = useId();

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [initialProfilePhoto, setInitialProfilePhoto] = useState<string | null>(
    null,
  );
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [initialProfile, setInitialProfile] =
    useState<ProfileData>(DEFAULT_PROFILE);
  const [memberSinceLabel, setMemberSinceLabel] = useState("New member");
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    return () => {
      if (previewPhotoUrl) {
        URL.revokeObjectURL(previewPhotoUrl);
      }
    };
  }, [previewPhotoUrl]);

  useEffect(() => {
    const auth = getClientAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setErrorMessage("");
      setSuccessMessage("");

      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const { response, body } = await fetchWithAuth(user, "/api/profile");

        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(body, "Unable to load your profile right now."),
          );
        }

        const data = extractApiData<{ profile: ProfileRecord }>(body);
        const profile = data?.profile ?? null;
        const phoneParts = splitPhone(profile?.phone ?? null);
        const resolvedProfilePhoto =
          profile?.profileImageUrl ?? profile?.photoURL ?? null;
        const nextProfile: ProfileData = {
          name: profile?.name ?? "",
          email: profile?.email ?? user.email ?? "",
          countryCode: phoneParts.countryCode,
          phone: phoneParts.phone,
          address: profile?.address ?? "",
        };

        setPreviewPhotoUrl((previousPreviewUrl) => {
          if (previousPreviewUrl) {
            URL.revokeObjectURL(previousPreviewUrl);
          }

          return null;
        });

        setSelectedPhotoFile(null);
        setProfilePhoto(resolvedProfilePhoto);
        setInitialProfilePhoto(resolvedProfilePhoto);
        setMemberSinceLabel(
          profile?.createdAt
            ? new Date(profile.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
              })
            : "New member",
        );
        setFormData(nextProfile);
        setInitialProfile(nextProfile);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your profile right now.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage("Only JPG, PNG, and WEBP images are supported.");
      setSuccessMessage("");
      event.currentTarget.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      setErrorMessage("Image size must be 5MB or less.");
      setSuccessMessage("");
      event.currentTarget.value = "";
      return;
    }

    if (previewPhotoUrl) {
      URL.revokeObjectURL(previewPhotoUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setSelectedPhotoFile(file);
    setPreviewPhotoUrl(nextPreviewUrl);
    setErrorMessage("");
    setSuccessMessage("Image selected. Save changes to upload and persist it.");
  };

  const uploadProfilePhoto = async (user: FirebaseUser, file: File) => {
    setIsUploadingPhoto(true);

    try {
      const requestBody = new FormData();
      requestBody.append("file", file);

      const { response, body } = await fetchWithAuth(
        user,
        "/api/upload/profile-image",
        {
          method: "POST",
          body: requestBody,
        },
      );

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            body,
            "Unable to upload your profile image right now.",
          ),
        );
      }

      const data = extractApiData<{
        profileImageUrl?: string;
        photoURL?: string;
      }>(body);
      const uploadedImageUrl = data?.profileImageUrl ?? data?.photoURL ?? "";

      if (!uploadedImageUrl) {
        throw new Error(
          "Upload succeeded but no profile image URL was returned.",
        );
      }

      return uploadedImageUrl;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser) {
      setErrorMessage("Sign in to update your profile.");
      return;
    }

    const payload: Record<string, string> = {};
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedAddress = formData.address.trim();
    const trimmedInitialName = initialProfile.name.trim();
    const trimmedInitialPhone = initialProfile.phone.trim();
    const trimmedInitialAddress = initialProfile.address.trim();
    const mergedPhone = trimmedPhone
      ? `${formData.countryCode} ${trimmedPhone}`.trim()
      : "";
    const initialMergedPhone = trimmedInitialPhone
      ? `${initialProfile.countryCode} ${trimmedInitialPhone}`.trim()
      : "";

    if (trimmedName && trimmedName !== trimmedInitialName) {
      payload.name = trimmedName;
    }

    if (mergedPhone && mergedPhone !== initialMergedPhone) {
      payload.phone = mergedPhone;
    }

    if (trimmedAddress && trimmedAddress !== trimmedInitialAddress) {
      payload.address = trimmedAddress;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let uploadedProfileImageUrl = profilePhoto;

      if (selectedPhotoFile) {
        uploadedProfileImageUrl = await uploadProfilePhoto(
          currentUser,
          selectedPhotoFile,
        );
        payload.profileImageUrl = uploadedProfileImageUrl;
      }

      if (Object.keys(payload).length === 0) {
        setErrorMessage(
          "No changes detected. Update a field or choose a new image.",
        );
        return;
      }

      const { response, body } = await fetchWithAuth(
        currentUser,
        "/api/profile",
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(body, "Unable to update your profile right now."),
        );
      }

      const data = extractApiData<{ profile: ProfileRecord }>(body);
      const profile = data?.profile ?? null;
      const phoneParts = splitPhone(profile?.phone ?? payload.phone ?? null);
      const resolvedProfilePhoto =
        profile?.profileImageUrl ??
        profile?.photoURL ??
        uploadedProfileImageUrl ??
        null;
      const nextProfile: ProfileData = {
        name: profile?.name ?? formData.name,
        email: formData.email,
        countryCode: phoneParts.countryCode,
        phone: phoneParts.phone,
        address: profile?.address ?? formData.address,
      };

      if (previewPhotoUrl) {
        URL.revokeObjectURL(previewPhotoUrl);
      }

      setPreviewPhotoUrl(null);
      setSelectedPhotoFile(null);
      setProfilePhoto(resolvedProfilePhoto);
      setInitialProfilePhoto(resolvedProfilePhoto);
      setFormData(nextProfile);
      setInitialProfile(nextProfile);
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update your profile right now.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (previewPhotoUrl) {
      URL.revokeObjectURL(previewPhotoUrl);
    }

    setPreviewPhotoUrl(null);
    setSelectedPhotoFile(null);
    setProfilePhoto(initialProfilePhoto);
    setFormData(initialProfile);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleChangePassword = async () => {

    if (!currentUser) {
      const message = "Sign in to change your password.";
      setPasswordErrorMessage(message);
      setPasswordSuccessMessage("");
      toast.error(message);
      return;
    }

    if (passwordFormData.newPassword.length < 8) {
      const message = "New password must be at least 8 characters.";
      setPasswordErrorMessage(message);
      setPasswordSuccessMessage("");
      toast.error(message);
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      const message = "New passwords do not match.";
      setPasswordErrorMessage(message);
      setPasswordSuccessMessage("");
      toast.error(message);
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrorMessage("");
    setPasswordSuccessMessage("");

    try {
      const { response, body } = await fetchWithAuth(currentUser, "/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify(passwordFormData),
      });

      if (!response.ok) {
        const message = getApiErrorMessage(body, "Unable to change password right now.");
        setPasswordErrorMessage(message);
        toast.error(message);
        return;
      }

      const message = "Password updated successfully.";
      setPasswordSuccessMessage(message);
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      toast.success(message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to change password right now.";
      setPasswordErrorMessage(message);
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getClientAuth();
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#EFF6E7] flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 md:px-8 py-6 gap-4 md:gap-0">
        <h1 className="[font-family:'Epilogue-Black',Helvetica] font-black text-[#0d631b] text-3xl tracking-[-0.75px]">
          Account Settings
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 bg-[#e4e4cc] hover:bg-[#d9d9b8] rounded-2xl cursor-pointer transition-colors [font-family:'Manrope-Bold',Helvetica] font-bold text-[#75584d] text-base"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {isLoading && (
        <p className="px-4 md:px-8 text-sm font-semibold text-[#00450D]">
          Loading profile...
        </p>
      )}

      <div className="flex flex-col w-full items-start gap-8 px-4 md:px-8 py-6 md:py-12">
        <header className="flex flex-col items-start gap-1 w-full">
          <p className="relative flex items-center self-stretch [font-family:'Manrope-Medium',Helvetica] font-medium text-[#75584d] text-base tracking-[0] leading-6">
            Manage your digital greenhouse profile and security protocols.
          </p>
        </header>
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 w-full">
          <aside className="relative w-full lg:col-span-4 flex flex-col items-start px-4 md:px-6 py-8 md:py-10 bg-[#f5f5dc] rounded-[32px] overflow-hidden mb-6 lg:mb-0">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#0d631b0d] rounded-full" />
            <div className="relative w-full flex flex-col items-center justify-center min-h-[200px] md:h-[272px]">
              <div className="flex flex-col items-center gap-3 mt-8">
                <div className="justify-center w-fit [font-family:'Epilogue-Bold',Helvetica] font-bold text-[#1b1d0e] text-xl md:text-2xl text-center leading-8 flex items-center tracking-[0]">
                  {formData.name.trim() || "PiliSeed User"}
                </div>
                <div className="justify-center w-fit [font-family:'Manrope-Regular',Helvetica] font-normal text-[#75584d] text-base text-center leading-6 flex items-center tracking-[0]">
                  {`Member since ${memberSinceLabel}`}
                </div>
              </div>
              <div className="mb-4">
                {previewPhotoUrl || profilePhoto ? (
                  <img
                    alt={`${formData.name || "PiliSeed User"} profile`}
                    className="w-[140px] h-[140px] md:w-[232px] md:h-[242px] object-cover rounded-2xl"
                    src={previewPhotoUrl ?? profilePhoto ?? ""}
                  />
                ) : (
                  <div className="w-[140px] h-[140px] md:w-[232px] md:h-[242px] bg-gray-200 rounded-2xl flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#0d631b] flex items-center justify-center hover:bg-[#095612] transition-colors shadow-lg z-10"
                onClick={() => document.getElementById(photoInputId)?.click()}
                type="button"
                aria-label="Change profile photo"
                disabled={isSaving || isUploadingPhoto || isLoading}
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
              <input
                id={photoInputId}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                aria-label="Upload profile photo"
              />
              {isUploadingPhoto && (
                <p className="text-xs font-semibold text-[#00450D]">
                  Uploading image...
                </p>
              )}
            </div>
          </aside>
          <form
            className="relative w-full lg:col-span-8 flex flex-col items-start gap-6"
            onSubmit={handleSubmit}
          >
            <section
              aria-labelledby="personal-information-heading"
              className="flex flex-col items-start gap-6 p-4 md:p-6 w-full bg-white rounded-[32px] shadow-[0px_1px_2px_#0000000d]"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
                <div className="w-10 h-10 justify-center bg-[#e4e4cc] rounded-2xl flex items-center">
                  <User className="w-5 h-5 text-[#1b1d0e]" />
                </div>
                <div className="flex flex-col items-start">
                  <h2
                    className="w-fit [font-family:'Epilogue-Bold',Helvetica] font-bold text-[#1b1d0e] text-lg leading-7 whitespace-nowrap flex items-center tracking-[0]"
                    id="personal-information-heading"
                  >
                    Personal Information
                  </h2>
                  <p className="w-fit [font-family:'Manrope-Regular',Helvetica] font-normal text-[#75584d] text-sm leading-5 whitespace-nowrap flex items-center tracking-[0]">
                    Update your profile and contact details.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    FULL NAME
                  </label>
                  <div className="px-4 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                    <input
                      className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none placeholder:text-[#9a9a9a]"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    EMAIL ADDRESS
                  </label>
                  <div className="px-4 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                    <input
                      className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none placeholder:text-[#9a9a9a]"
                      type="email"
                      value={formData.email}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    PHONE NUMBER
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="w-full sm:w-20 px-3 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                      <select
                        className="w-full border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-sm p-0 outline-none cursor-pointer"
                        value={formData.countryCode}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            countryCode: e.target.value,
                          }))
                        }
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+63">+63</option>
                      </select>
                    </div>
                    <div className="flex-1 px-4 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                      <input
                        className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none placeholder:text-[#9a9a9a]"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    ADDRESS
                  </label>
                  <div className="px-4 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                    <input
                      className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none placeholder:text-[#9a9a9a]"
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="private-security-heading"
              className="flex flex-col items-start gap-6 p-4 md:p-6 w-full bg-white rounded-[32px] shadow-[0px_1px_2px_#0000000d]"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
                <div className="w-10 h-10 justify-center bg-[#e4e4cc] rounded-2xl flex items-center">
                  <Lock className="w-5 h-5 text-[#1b1d0e]" />
                </div>
                <div className="flex flex-col items-start">
                  <h2
                    className="w-fit [font-family:'Epilogue-Bold',Helvetica] font-bold text-[#1b1d0e] text-lg leading-7 whitespace-nowrap flex items-center tracking-[0]"
                    id="private-security-heading"
                  >
                    Private: Change Password
                  </h2>
                  <p className="w-fit [font-family:'Manrope-Regular',Helvetica] font-normal text-[#75584d] text-sm leading-5 whitespace-nowrap flex items-center tracking-[0]">
                    Update your account password securely.
                  </p>
                </div>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    CURRENT PASSWORD
                  </label>
                  <div className="px-4 py-3 flex items-center gap-2 bg-[#eaead1] rounded-xl overflow-hidden">
                    <input
                      className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordFormData.currentPassword}
                      onChange={(e) =>
                        setPasswordFormData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="text-[#5f6a59]"
                      onClick={() => setShowCurrentPassword((value) => !value)}
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    NEW PASSWORD
                  </label>
                  <div className="px-4 py-3 flex items-center gap-2 bg-[#eaead1] rounded-xl overflow-hidden">
                    <input
                      className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordFormData.newPassword}
                      onChange={(e) =>
                        setPasswordFormData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="text-[#5f6a59]"
                      onClick={() => setShowNewPassword((value) => !value)}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    CONFIRM NEW PASSWORD
                  </label>
                  <div className="px-4 py-3 flex items-center gap-2 bg-[#eaead1] rounded-xl overflow-hidden">
                    <input
                      className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none"
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={passwordFormData.confirmNewPassword}
                      onChange={(e) =>
                        setPasswordFormData((prev) => ({
                          ...prev,
                          confirmNewPassword: e.target.value,
                        }))
                      }
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="text-[#5f6a59]"
                      onClick={() => setShowConfirmNewPassword((value) => !value)}
                      aria-label={showConfirmNewPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-[#9C4A00] w-full md:w-auto">
                    {passwordErrorMessage}
                  </div>
                  <div className="text-sm font-semibold text-[#00450D] w-full md:w-auto">
                    {passwordSuccessMessage}
                  </div>
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <button
                    className="all-[unset] box-border inline-flex flex-col items-center justify-center px-8 py-3 relative flex-[0_0_auto] bg-[#0d631b] rounded-2xl cursor-pointer"
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || isLoading || isSaving || isUploadingPhoto}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-[#ffffff01] rounded-2xl shadow-[0px_8px_10px_-6px_#0d631b33,0px_20px_25px_-5px_#0d631b33]" />
                    <div className="justify-center w-fit mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-white text-base text-center leading-6 whitespace-nowrap relative flex items-center tracking-[0]">
                      {isChangingPassword ? "Changing Password..." : "Change Password"}
                    </div>
                  </button>
                </div>
              </div>
            </section>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
              <div className="text-sm font-semibold text-[#9C4A00]">
                {errorMessage}
              </div>
              <div className="text-sm font-semibold text-[#00450D]">
                {successMessage}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 w-full">
              <button
                className="all-[unset] box-border inline-flex flex-col items-center justify-center px-8 py-3 relative flex-[0_0_auto] bg-[#e4e4cc] rounded-2xl cursor-pointer"
                onClick={handleCancel}
                type="button"
                disabled={isSaving || isLoading || isUploadingPhoto}
              >
                <div className="justify-center w-fit mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#75584d] text-base text-center leading-6 whitespace-nowrap relative flex items-center tracking-[0]">
                  Cancel Changes
                </div>
              </button>
              <button
                className="all-[unset] box-border inline-flex flex-col items-center justify-center px-8 py-3 relative flex-[0_0_auto] bg-[#0d631b] rounded-2xl cursor-pointer"
                type="submit"
                disabled={isSaving || isLoading || isUploadingPhoto}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-[#ffffff01] rounded-2xl shadow-[0px_8px_10px_-6px_#0d631b33,0px_20px_25px_-5px_#0d631b33]" />
                <div className="justify-center w-fit mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-white text-base text-center leading-6 whitespace-nowrap relative flex items-center tracking-[0]">
                  {isUploadingPhoto
                    ? "Uploading Image..."
                    : isSaving
                      ? "Saving..."
                      : "Save All Changes"}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
