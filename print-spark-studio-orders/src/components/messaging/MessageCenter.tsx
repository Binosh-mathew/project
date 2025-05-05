import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { Minus, Maximize2, X, Paperclip, Image, Send, Reply, Mail, CheckCircle, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { User as AuthUser } from '@/types/auth';
import { api } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Extend the User interface from auth
interface MessageUser extends AuthUser {
  storeName: string;
}

// Mock recent messages data
const initialRecentMessages: RecentMessage[] = [
  {
    id: '1',
    subject: 'Order Processing Issue',
    sender: 'John Smith',
    senderId: 'SM001',
    shopName: 'Print Shop Downtown',
    receiver: 'Developer Team',
    timestamp: new Date().toISOString(),
    status: 'unread',
    content: 'We are experiencing issues with order processing. Need immediate assistance.',
    type: 'support'
  },
  {
    id: '2',
    subject: 'Feature Request: Bulk Orders',
    sender: 'Sarah Johnson',
    senderId: 'SM002',
    shopName: 'Quick Print Express',
    receiver: 'Developer Team',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'read',
    content: 'Can we add a feature to process multiple orders at once? This would greatly improve our efficiency.',
    type: 'improvement'
  },
  {
    id: '3',
    subject: 'UI Enhancement Suggestion',
    sender: 'Mike Wilson',
    senderId: 'SM003',
    shopName: 'Digital Print Solutions',
    receiver: 'Developer Team',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'read',
    content: 'The order details page could use some improvements in layout and readability.',
    type: 'improvement'
  }
];

// Function to get admins from localStorage
const getAdminsFromStorage = (): MessageUser[] => {
  try {
    const storedUsers = localStorage.getItem('print_spark_users');
    if (storedUsers) {
      const allUsers = JSON.parse(storedUsers);
      // Filter only admin users and format them as MessageUser
      return allUsers.filter((user: any) => user.role === 'admin').map((admin: any) => ({
        id: admin.id,
        name: admin.name,
        storeName: admin.storeName,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }));
    }
  } catch (error) {
    console.error('Error loading admins:', error);
  }
  return [];
};

interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'support' | 'improvement' | 'general';
  status: 'unread' | 'read';
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender?: string;
  shopName?: string;
  timestamp?: string;
  replies?: Message[];
}

type MessageStatus = 'unread' | 'read' | 'sent';

interface RecentMessage {
  id: string;
  subject: string;
  sender: string;
  senderId: string;
  shopName: string;
  receiver: string;
  timestamp: string;
  status: MessageStatus;
  content: string;
  type: 'support' | 'improvement' | 'general';
  replyTo?: string;
  replies?: RecentMessage[];
}

interface MessageCenterProps {
  onClose?: () => void;
  viewMessage?: Message;
  isAdminView?: boolean;
}

const MessageCenter: React.FC<MessageCenterProps> = ({ onClose, viewMessage, isAdminView = false }) => {
  const { user } = useAuth();
  const messageUser = user as MessageUser;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(viewMessage?.content || '');
  const [subject, setSubject] = useState(viewMessage?.subject || '');
  const [isReplying, setIsReplying] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [recentMessagesList, setRecentMessagesList] = useState<RecentMessage[]>([]);
  const [messageType, setMessageType] = useState<'support' | 'improvement' | 'general'>('general');
  const [selectedAdmin, setSelectedAdmin] = useState<MessageUser | null>(null);
  const [admins, setAdmins] = useState<MessageUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertToMessage = (recentMessage: RecentMessage): Message => {
    return {
      id: recentMessage.id,
      subject: recentMessage.subject,
      content: recentMessage.content,
      type: recentMessage.type,
      status: recentMessage.status === 'sent' ? 'read' : recentMessage.status,
      createdAt: recentMessage.timestamp,
      senderId: recentMessage.senderId,
      receiverId: isAdminView ? '1' : messageUser?.id || '',
      sender: recentMessage.sender,
      shopName: recentMessage.shopName,
      timestamp: recentMessage.timestamp,
      replies: recentMessage.replies?.map(convertToMessage)
    };
  };

  useEffect(() => {
    loadMessages();
    loadAdmins();
  }, [isAdminView]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/messages');
      setMessages(response.data.data);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await api.get('/admins');
      setAdmins(response.data.data);
    } catch (err) {
      console.error('Error loading admins:', err);
    }
  };

  const saveMessages = (messages: RecentMessage[], storageKey: string) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const updateRecentMessages = (newMessage: RecentMessage) => {
    // Update sender's view
    const senderStorageKey = isAdminView ? 'adminRecentMessages' : 'devRecentMessages';
    const senderMessage: RecentMessage = {
      ...newMessage,
      sender: isAdminView ? 'You' : 'Developer Team',
      status: 'sent' as MessageStatus,
      replies: []
    };
    
    setRecentMessagesList(prevMessages => {
      let updatedMessages;
      if (newMessage.replyTo) {
        // If this is a reply, find the original message and add this as a reply
        updatedMessages = prevMessages.map(msg => {
          if (msg.id === newMessage.replyTo) {
            return {
              ...msg,
              replies: [...(msg.replies || []), senderMessage]
            };
          }
          return msg;
        });
      } else {
        // If this is a new message, add it to the top
        updatedMessages = [senderMessage, ...prevMessages];
      }
      saveMessages(updatedMessages, senderStorageKey);
      return updatedMessages;
    });

    // Update receiver's view
    const receiverStorageKey = isAdminView ? 'devRecentMessages' : 'adminRecentMessages';
    const receiverMessage: RecentMessage = {
      ...newMessage,
      sender: isAdminView ? 'Store Manager' : 'Developer Team',
      status: 'unread' as MessageStatus,
      replies: []
    };

    const storedReceiverMessages = localStorage.getItem(receiverStorageKey);
    const receiverMessages = storedReceiverMessages ? JSON.parse(storedReceiverMessages) as RecentMessage[] : [];
    
    let updatedReceiverMessages;
    if (newMessage.replyTo) {
      // If this is a reply, find the original message and add this as a reply
      updatedReceiverMessages = receiverMessages.map(msg => {
        if (msg.id === newMessage.replyTo) {
          return {
            ...msg,
            replies: [...(msg.replies || []), receiverMessage]
          };
        }
        return msg;
      });
    } else {
      // If this is a new message, add it to the top
      updatedReceiverMessages = [receiverMessage, ...receiverMessages];
    }
    
    saveMessages(updatedReceiverMessages, receiverStorageKey);
  };

  const sendMessage = async () => {
    try {
      const messageData = {
        subject,
      content: newMessage,
        type: messageType,
        receiverId: selectedAdmin?.id
      };

      await api.post('/messages', messageData);
      toast({
        title: 'Success',
        description: 'Message sent successfully'
      });
      
    setNewMessage('');
      setSubject('');
      setIsComposing(false);
      loadMessages();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
      console.error('Error sending message:', err);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      loadMessages();
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  return (
    <div className="flex flex-col w-full h-full border rounded-lg bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-lg">
        <h2 className="text-base font-medium">
          {viewMessage ? (isReplying ? 'Reply to Developer Team' : 'View Message') : 
           selectedMessage ? 'View Message' : 
           isComposing ? 'New Message to Developer Team' : 'Messages'}
        </h2>
      </div>
      
      {!viewMessage && !selectedMessage && !isComposing ? (
        <>
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h3 className="font-medium">Messages to Developer Team</h3>
            <Button
              onClick={() => {
                setIsComposing(true);
                setSubject('');
                setNewMessage('');
                setMessageType('general');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center space-x-2"
            >
              <span>New Message</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            {recentMessagesList.length > 0 ? (
              recentMessagesList.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(convertToMessage(message))}
                  className="flex items-center px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {message.status === 'unread' ? (
                          <div className="flex items-center text-blue-600">
                            <Mail className="h-4 w-4 mr-2" />
                          </div>
                        ) : message.status === 'sent' ? (
                          <div className="flex items-center text-green-600">
                            <Send className="h-4 w-4 mr-2" />
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <CheckCircle className="h-4 w-4 mr-2" />
                          </div>
                        )}
                        <span className="font-medium">{message.sender}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1">
                      <div className="font-medium">{message.subject}</div>
                      <p className="text-sm text-gray-600 truncate">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No messages yet
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col border-b">
            <div className="flex items-center px-4 py-1">
              <div className="flex flex-col w-full space-y-2">
                {((viewMessage || selectedMessage) && !isReplying) || (!isComposing && !isReplying) ? (
                  <div className="space-y-2 py-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium">
                        {isAdminView ? 
                          ((viewMessage || selectedMessage)?.sender === 'Developer Team' ? 'Developer Team' : 'You') :
                          (viewMessage || selectedMessage)?.sender}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Store ID:</span>
                      <span className="font-medium">
                        {isAdminView ? 
                          ((viewMessage || selectedMessage)?.sender === 'Developer Team' ? '1' : messageUser?.id) :
                          (viewMessage || selectedMessage)?.senderId}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shop Name:</span>
                      <span className="font-medium">
                        {isAdminView ? 
                          ((viewMessage || selectedMessage)?.sender === 'Developer Team' ? 'Developer Team HQ' : (viewMessage || selectedMessage)?.shopName) :
                          (viewMessage || selectedMessage)?.shopName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subject:</span>
                      <span className="font-medium">{(viewMessage || selectedMessage)?.subject}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{(viewMessage || selectedMessage)?.type || 'General'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <div className="text-sm text-gray-500">
                        {viewMessage || selectedMessage ? 
                          new Date((viewMessage || selectedMessage)?.timestamp || '').toLocaleString() : 
                          ''}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isAdminView && !isReplying && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">To:</span>
                        <select
                          value={selectedAdmin?.id || ''}
                          onChange={(e) => {
                            const admin = admins.find(a => a.id === e.target.value);
                            setSelectedAdmin(admin || null);
                          }}
                          className="flex-1 border-0 border-b border-gray-200 focus:ring-0 text-sm py-1 rounded-none focus:border-blue-500 bg-transparent"
                        >
                          <option value="">Select Admin</option>
                          {admins.map(admin => (
                            <option key={admin.id} value={admin.id}>
                              {admin.storeName || admin.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {isReplying && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">To: {(viewMessage || selectedMessage)?.sender}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Store: {isAdminView ? messageUser?.storeName || 'Unknown Store' : (isReplying ? (viewMessage || selectedMessage)?.shopName : selectedAdmin?.storeName || "")}</span>
                    </div>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                      className="border-b border-0 border-gray-200 focus:ring-0 text-sm py-1 rounded-none focus:border-blue-500"
                  placeholder="Subject"
                />
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value as 'support' | 'improvement' | 'general')}
                      className="border-0 border-b border-gray-200 focus:ring-0 text-sm py-1 rounded-none focus:border-blue-500 bg-transparent"
                    >
                      <option value="general">General Message</option>
                      <option value="support">Support Request</option>
                      <option value="improvement">Improvement Suggestion</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4 pt-2 bg-white">
            {((viewMessage || selectedMessage) && !isReplying) || (!isComposing && !isReplying) ? (
              <div className="px-4">
                <div className="prose max-w-none py-4 border-b">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {(viewMessage || selectedMessage)?.content || "No content available."}
                  </p>
                </div>
                
                {/* Show replies if they exist */}
                {(() => {
                  const message = viewMessage || selectedMessage;
                  const replies = message?.replies ?? [];
                  return replies.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <h4 className="text-sm font-medium text-gray-600">Replies</h4>
                      {replies.map((reply) => (
                        <div key={reply.id} className="border-l-2 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{reply.sender}</span>
                            <span className="text-xs text-gray-500">
                              {reply.timestamp ? new Date(reply.timestamp).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-gray-800 text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                            message.senderId === messageUser?.id ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                              message.senderId === messageUser?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-xs opacity-70">
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </ScrollArea>
          
          <div className="p-4 pt-2 border-t bg-white">
            {((viewMessage || selectedMessage) && !isReplying) || (!isComposing && !isReplying) ? (
              <div className="flex justify-between">
                <Button
                  onClick={() => {
                    setSelectedMessage(null);
                    setIsComposing(false);
                    if (!viewMessage) {
                      setSubject('');
                      setNewMessage('');
                    }
                  }}
                  variant="outline"
                  className="px-6 py-2 h-10 rounded-full flex items-center space-x-2"
                >
                  <span>Back</span>
                </Button>
                <Button
                  onClick={() => setIsReplying(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 h-10 rounded-full flex items-center space-x-2"
                >
                  <Reply className="h-4 w-4" />
                  <span>Reply</span>
                </Button>
              </div>
            ) : (
              <>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[150px] resize-none focus:ring-0 border-0 mb-4 text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 h-10 rounded-full flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </Button>
                <div className="flex items-center space-x-1 ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-gray-100 h-9 w-9 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.click();
                    }}
                  >
                    <Paperclip className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-gray-100 h-9 w-9 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.click();
                    }}
                  >
                    <Image className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-gray-100 h-9 w-9 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewMessage('');
                }}
              >
                <X className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MessageCenter;