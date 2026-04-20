"use client";
import { FormEvent, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { User, ChevronDown, Lock, Upload, Camera, LogOut } from "lucide-react";
import { getClientAuth } from "@/lib/firebaseClient";

export default function ProfilePage() {
  const router = useRouter();
  const photoInputId = useId();

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "Alex Rivera",
    email: "alex.rivera@agritech.com",
    countryCode: "+1",
    phone: "555-0123-4567",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleCancel = () => {
    setFormData({
      fullName: "Alex Rivera",
      email: "alex.rivera@agritech.com",
      countryCode: "+1",
      phone: "555-0123-4567",
      newPassword: "",
      confirmPassword: "",
    });
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
    <main className="min-h-screen bg-[#EFF6E7] flex flex-col">
      <div className="flex items-center justify-between px-8 py-6">
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

      <div className="flex flex-col w-full items-start gap-8 px-8 py-12">
        <header className="flex flex-col items-start gap-1 relative self-stretch w-full">
          <p className="relative flex items-center self-stretch [font-family:'Manrope-Medium',Helvetica] font-medium text-[#75584d] text-base tracking-[0] leading-6">
            Manage your digital greenhouse profile and security protocols.
          </p>
        </header>
        <div className="grid grid-cols-12 h-fit gap-6 w-full">
          <aside className="relative row-[1_/_2] col-[1_/_5] w-full h-fit flex flex-col items-start px-6 py-10 bg-[#f5f5dc] rounded-[32px] overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#0d631b0d] rounded-full" />
            <div className="relative self-stretch w-full h-[272px] flex flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-3 mt-8">
                <div className="justify-center w-fit [font-family:'Epilogue-Bold',Helvetica] font-bold text-[#1b1d0e] text-2xl text-center leading-8 relative flex items-center tracking-[0]">
                  Alex Rivera
                </div>
                <div className="justify-center w-fit [font-family:'Manrope-Regular',Helvetica] font-normal text-[#75584d] text-base text-center leading-6 relative flex items-center tracking-[0]">
                  Member since March 2023
                </div>
              </div>
              <div className="mb-4">
                {profilePhoto ? (
                  <img
                    alt="Alex Rivera profile"
                    className="w-[232px] h-[242px] object-cover rounded-2xl"
                    src={profilePhoto}
                  />
                ) : (
                  <div className="w-[232px] h-[242px] bg-gray-200 rounded-2xl flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#0d631b] flex items-center justify-center hover:bg-[#095612] transition-colors shadow-lg z-10"
                onClick={() => document.getElementById(photoInputId)?.click()}
                type="button"
                aria-label="Change profile photo"
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
            </div>
          </aside>
          <form
            className="relative row-[1_/_2] col-[5_/_13] w-full h-fit flex flex-col items-start gap-6"
            onSubmit={handleSubmit}
          >
            <section
              aria-labelledby="personal-information-heading"
              className="flex flex-col items-start gap-6 p-6 relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[32px] shadow-[0px_1px_2px_#0000000d]"
            >
              <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <div className="w-10 h-10 justify-center bg-[#e4e4cc] rounded-2xl flex items-center relative">
                  <User className="w-5 h-5 text-[#1b1d0e]" />
                </div>
                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                  <div className="items-start relative self-stretch flex-[0_0_auto] flex flex-col w-full">
                    <h2
                      className="w-fit mt-[-1.00px] [font-family:'Epilogue-Bold',Helvetica] font-bold text-[#1b1d0e] text-lg leading-7 whitespace-nowrap relative flex items-center tracking-[0]"
                      id="personal-information-heading"
                    >
                      Personal Information
                    </h2>
                  </div>
                  <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                    <p className="w-fit mt-[-1.00px] [font-family:'Manrope-Regular',Helvetica] font-normal text-[#75584d] text-sm leading-5 whitespace-nowrap relative flex items-center tracking-[0]">
                      Update your profile and contact details.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    FULL NAME
                  </label>
                  <div className="px-4 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                    <input
                      className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none placeholder:text-[#9a9a9a]"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="col-span-2 flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    PHONE NUMBER
                  </label>
                  <div className="flex gap-4">
                    <div className="w-20 px-3 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                      <select
                        className="w-full border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-sm p-0 outline-none cursor-pointer"
                        value={formData.countryCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                      >
                        <option value="+1">+1</option>
                      </select>
                    </div>
                    <div className="flex-1 px-4 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                      <input
                        className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none placeholder:text-[#9a9a9a]"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section
              aria-labelledby="security-heading"
              className="flex flex-col items-start gap-6 p-6 relative self-stretch w-full flex-[0_0_auto] bg-white rounded-[32px] shadow-[0px_1px_2px_#0000000d]"
            >
              <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <div className="w-10 h-10 justify-center bg-[#e4e4cc] rounded-2xl flex items-center relative">
                  <Lock className="w-4 h-5 text-[#1b1d0e]" />
                </div>
                <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                  <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                    <h2
                      className="w-fit mt-[-1.00px] [font-family:'Epilogue-Bold',Helvetica] font-bold text-[#1b1d0e] text-lg leading-7 whitespace-nowrap relative flex items-center tracking-[0]"
                      id="security-heading"
                    >
                      Security
                    </h2>
                  </div>
                  <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                    <p className="w-fit mt-[-1.00px] [font-family:'Manrope-Regular',Helvetica] font-normal text-[#75584d] text-sm leading-5 whitespace-nowrap relative flex items-center tracking-[0]">
                      Maintain account safety and authentication settings.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    NEW PASSWORD
                  </label>
                  <div className="px-4 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                    <input
                      className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none placeholder:text-[#9a9a9a]"
                      type="password"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <label className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493e] text-sm tracking-[0] leading-5">
                    CONFIRM PASSWORD
                  </label>
                  <div className="px-4 py-3 flex items-center bg-[#eaead1] rounded-xl overflow-hidden">
                    <input
                      className="grow border-none bg-transparent [font-family:'Manrope-Regular',Helvetica] font-normal text-[#1b1d0e] text-base tracking-[0] leading-6 p-0 outline-none placeholder:text-[#9a9a9a]"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </section>
            <div className="flex items-center justify-end gap-3 pt-2 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
              <button
                className="all-[unset] box-border inline-flex flex-col items-center justify-center px-8 py-3 relative flex-[0_0_auto] bg-[#e4e4cc] rounded-2xl cursor-pointer"
                onClick={handleCancel}
                type="button"
              >
                <div className="justify-center w-fit mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-[#75584d] text-base text-center leading-6 whitespace-nowrap relative flex items-center tracking-[0]">
                  Cancel Changes
                </div>
              </button>
              <button
                className="all-[unset] box-border inline-flex flex-col items-center justify-center px-8 py-3 relative flex-[0_0_auto] bg-[#0d631b] rounded-2xl cursor-pointer"
                type="submit"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-[#ffffff01] rounded-2xl shadow-[0px_8px_10px_-6px_#0d631b33,0px_20px_25px_-5px_#0d631b33]" />
                <div className="justify-center w-fit mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-white text-base text-center leading-6 whitespace-nowrap relative flex items-center tracking-[0]">
                  Save All Changes
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}