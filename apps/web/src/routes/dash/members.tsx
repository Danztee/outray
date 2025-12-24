import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreVertical, X, Mail, Shield, Loader2 } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { useState, useEffect } from "react";
import { useAppStore } from "../../lib/store";

export const Route = createFileRoute("/dash/members")({
  component: MembersView,
});

function MembersView() {
  const { selectedOrganizationId } = useAppStore();
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin" | "owner">(
    "member",
  );
  const [isInviting, setIsInviting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!selectedOrganizationId) return;
    setIsLoading(true);
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        authClient.organization.listMembers({
          query: {
            organizationId: selectedOrganizationId,
          },
        }),
        authClient.organization.listInvitations({
          query: {
            organizationId: selectedOrganizationId,
          },
        }),
      ]);

      if (membersRes.data) setMembers(membersRes.data.members || []);
      if (invitationsRes.data) {
        // Filter out cancelled and accepted invitations
        const activeInvitations = invitationsRes.data.filter(
          (inv: any) =>
            inv.status !== "canceled" &&
            inv.status !== "cancelled" &&
            inv.status !== "accepted",
        );
        setInvitations(activeInvitations);
      }
    } catch (e) {
      console.error("Failed to fetch members/invitations", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedOrganizationId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganizationId) return;

    setIsInviting(true);
    try {
      const res = await authClient.organization.inviteMember({
        email: inviteEmail,
        role: inviteRole,
        organizationId: selectedOrganizationId,
      });

      if (res.error) {
        alert(res.error.message);
      } else {
        setInviteEmail("");
        setIsInviteModalOpen(false);
        fetchData();
      }
    } catch (e) {
      alert("Failed to invite member");
    } finally {
      setIsInviting(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;

    // Optimistic update - remove from UI immediately
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));

    try {
      const res = await authClient.organization.cancelInvitation({
        invitationId,
      });

      if (res.error) {
        alert(res.error.message);
        // Revert on error
        fetchData();
      }
    } catch (e) {
      alert("Failed to cancel invitation");
      // Revert on error
      fetchData();
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    // Optimistic update - remove from UI immediately
    setMembers((prev) => prev.filter((member) => member.id !== memberId));

    try {
      const res = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: selectedOrganizationId!,
      });

      if (res.error) {
        alert(res.error.message);
        // Revert on error
        fetchData();
      }
    } catch (e) {
      alert("Failed to remove member");
      // Revert on error
      fetchData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Members
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage who has access to this organization
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          <Plus size={18} />
          Invite Member
        </button>
      </div>

      <div className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-medium text-white">Team Members</h3>
        </div>

        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <>
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {member.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">
                          {member.user.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${member.role === "owner" ? "bg-accent/10 text-accent border-accent/20" : "bg-white/5 text-gray-400 border-white/10"}`}
                        >
                          {member.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {member.role !== "owner" && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors opacity-75"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 font-bold">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="text-gray-400 font-medium">
                        Invited: {invitation.email}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Role: {invitation.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
                      Pending
                    </span>
                    <button
                      onClick={() => cancelInvitation(invitation.id)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {members.length === 0 && invitations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No members found
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#101010] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Invite Member</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-hidden focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                    placeholder="colleague@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Role
                </label>
                <div className="relative">
                  <Shield
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(
                        e.target.value as "member" | "admin" | "owner",
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-hidden focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all appearance-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex-1 px-4 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isInviting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
