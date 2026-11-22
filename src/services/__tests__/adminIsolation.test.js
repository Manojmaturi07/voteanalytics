import { describe, it, expect, beforeEach, vi } from 'vitest';

// State for mock backend
let mockUsers = [];
let mockPolls = [];
let nextUserId = 1;
let nextPollId = 1;

vi.mock('axios', () => {
  const createMock = () => {
    const instance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      post: vi.fn(async (url, data) => {
        if (url === '/auth/login') {
          const user = mockUsers.find(u => u.username === data.username);
          if (!user || data.password !== user.password) {
            const err = new Error('Invalid credentials');
            err.response = { status: 401, data: { message: 'Invalid credentials' } };
            throw err;
          }
          return {
            data: {
              success: true,
              token: 'jwt-token-' + user.id,
              user: { id: user.id, username: user.username, name: user.name, role: user.role }
            }
          };
        }
        if (url === '/auth/register' || url === '/auth/admin/register') {
          const role = url.includes('admin') ? 'ADMIN' : 'USER';
          const newUser = { id: (nextUserId++).toString(), ...data, role };
          mockUsers.push(newUser);
          return {
            data: {
              success: true,
              token: 'jwt-token-' + newUser.id,
              user: { id: newUser.id, username: newUser.username, name: newUser.name, role: newUser.role }
            }
          };
        }
        if (url === '/polls') {
          const newPoll = {
            id: (nextPollId++).toString(),
            question: data.question,
            options: (data.options || []).map((o, i) => ({ id: i + 1, text: o, votes: 0 })),
            deadline: data.deadline,
            createdBy: currentAdminId,
            createdByName: 'Admin',
            isPublished: true,
          };
          mockPolls.push(newPoll);
          return { data: { success: true, data: newPoll } };
        }
        if (url.includes('/vote')) {
          return { data: { success: true } };
        }
        return { data: { success: true } };
      }),
      get: vi.fn(async (url) => {
        if (url === '/polls') {
          return { data: { data: mockPolls } };
        }
        if (url === '/polls/admin/my-polls') {
          const filtered = mockPolls.filter(p => p.createdBy === currentAdminId);
          return { data: { data: filtered } };
        }
        if (url.includes('/voting-details')) {
          const pollId = url.split('/')[2];
          const poll = mockPolls.find(p => p.id === pollId);
          if (poll && poll.createdBy !== currentAdminId) {
            const err = new Error('Unauthorized');
            err.response = { status: 403, data: { message: 'Unauthorized: You can only view details for polls you created' } };
            throw err;
          }
          return { data: { data: [] } };
        }
        return { data: { data: [] } };
      }),
      put: vi.fn(async (url, data) => {
        const pollId = url.split('/')[2];
        const poll = mockPolls.find(p => p.id === pollId);
        if (poll && poll.createdBy !== currentAdminId) {
          const err = new Error('Unauthorized');
          err.response = { status: 403, data: { message: 'Unauthorized: You can only edit polls you created' } };
          throw err;
        }
        return { data: { success: true } };
      }),
      delete: vi.fn(async (url) => {
        const pollId = url.split('/')[2];
        const poll = mockPolls.find(p => p.id === pollId);
        if (poll && poll.createdBy !== currentAdminId) {
          const err = new Error('Unauthorized');
          err.response = { status: 403, data: { message: 'Unauthorized: You can only delete polls you created' } };
          throw err;
        }
        mockPolls = mockPolls.filter(p => p.id !== pollId);
        return { data: { success: true } };
      }),
    };
    return instance;
  };

  const defaultAxios = createMock();
  defaultAxios.create = createMock;
  return {
    default: defaultAxios,
    ...defaultAxios,
  };
});

let currentAdminId = '3';

import { authAPI, pollsAPI } from '../api.js';

describe('Admin Poll Isolation', () => {
  beforeEach(async () => {
    mockUsers = [
      { id: '3', username: 'admin', password: 'admin123', name: 'Administrator', role: 'ADMIN' }
    ];
    mockPolls = [];
    nextUserId = 4;
    nextPollId = 1;
    currentAdminId = '3';
    localStorage.clear();
  });

  it('tags new polls with current admin ID and allows admin to view their own polls', async () => {
    currentAdminId = '3';
    await authAPI.login('admin', 'admin123');
    const admin = authAPI.getCurrentAdmin();
    expect(admin.id).toBe('3');

    const createRes = await pollsAPI.createPoll({
      question: 'Poll by Default Admin',
      options: ['Option 1', 'Option 2'],
      deadline: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(createRes.data.createdBy).toBe('3');

    const adminPolls = await pollsAPI.getAdminPolls();
    expect(adminPolls.data.some(p => p.id === createRes.data.id)).toBe(true);
  });

  it('hides polls created by one admin from another admin', async () => {
    // Admin 1 creates a poll
    currentAdminId = '3';
    await authAPI.login('admin', 'admin123');
    const poll1Res = await pollsAPI.createPoll({
      question: 'Admin 1 Unique Question',
      options: ['A', 'B'],
      deadline: new Date(Date.now() + 86400000).toISOString(),
    });
    const poll1Id = poll1Res.data.id;
    await authAPI.logout();

    // Register & login as Admin 2
    const admin2RegisterRes = await authAPI.adminRegister('new_admin', 'newadmin@example.com', 'Admin@123', 'New Admin');
    currentAdminId = admin2RegisterRes.user.id;
    await authAPI.login('new_admin', 'Admin@123');

    // Admin 2 should not see Admin 1's poll in getAdminPolls
    const admin2Polls = await pollsAPI.getAdminPolls();
    expect(admin2Polls.data.some(p => p.id === poll1Id)).toBe(false);

    // Admin 2 creates their own poll
    const poll2Res = await pollsAPI.createPoll({
      question: 'Admin 2 Unique Question',
      options: ['X', 'Y'],
      deadline: new Date(Date.now() + 86400000).toISOString(),
    });
    const poll2Id = poll2Res.data.id;

    // Admin 2 sees only their own poll
    const admin2PollsUpdated = await pollsAPI.getAdminPolls();
    expect(admin2PollsUpdated.data.some(p => p.id === poll2Id)).toBe(true);
    expect(admin2PollsUpdated.data.some(p => p.id === poll1Id)).toBe(false);
  });

  it('prevents an admin from editing, deleting, or viewing voting details of another admin poll', async () => {
    // Admin 1 creates a poll
    currentAdminId = '3';
    await authAPI.login('admin', 'admin123');
    const poll1Res = await pollsAPI.createPoll({
      question: 'Admin 1 Private Poll',
      options: ['A', 'B'],
      deadline: new Date(Date.now() + 86400000).toISOString(),
    });
    const poll1Id = poll1Res.data.id;
    await authAPI.logout();

    // Register & login as Admin 2
    const admin2RegisterRes = await authAPI.adminRegister('admin_sec', 'adminsec@example.com', 'Admin@123', 'Admin Sec');
    currentAdminId = admin2RegisterRes.user.id;
    await authAPI.login('admin_sec', 'Admin@123');

    // Unauthorized operations should reject
    await expect(pollsAPI.updatePoll(poll1Id, { question: 'Tampered Question' })).rejects.toThrow(
      /Unauthorized/
    );
    await expect(pollsAPI.deletePoll(poll1Id)).rejects.toThrow(/Unauthorized/);
    await expect(pollsAPI.getPollVotingDetails(poll1Id)).rejects.toThrow(/Unauthorized/);
  });

  it('allows public voter view to see active polls across admins', async () => {
    // Admin 1 creates poll
    currentAdminId = '3';
    await authAPI.login('admin', 'admin123');
    const p1 = await pollsAPI.createPoll({
      question: 'Cross Admin Poll 1',
      options: ['1', '2'],
      deadline: new Date(Date.now() + 86400000).toISOString(),
    });
    await authAPI.logout();

    // Admin 2 creates poll
    const a2 = await authAPI.adminRegister('admin_cross', 'cross@example.com', 'Admin@123', 'Cross Admin');
    currentAdminId = a2.user.id;
    await authAPI.login('admin_cross', 'Admin@123');
    const p2 = await pollsAPI.createPoll({
      question: 'Cross Admin Poll 2',
      options: ['1', '2'],
      deadline: new Date(Date.now() + 86400000).toISOString(),
    });
    await authAPI.logout();

    // Public / voter view
    const allPolls = await pollsAPI.getAllPolls();
    expect(allPolls.data.some(p => p.id === p1.data.id)).toBe(true);
    expect(allPolls.data.some(p => p.id === p2.data.id)).toBe(true);
  });
});
