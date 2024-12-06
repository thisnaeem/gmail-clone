import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'prose prose-invert min-h-[200px] max-w-none p-4 focus:outline-none'
      }
    },
    content: '',
  });

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setTo('');
      setSubject('');
      setError('');
      if (editor) {
        editor.commands.clearContent();
      }
    }
  }, [isOpen, editor]);

  const handleSend = async () => {
    if (!editor) return;

    try {
      setError('');
      
      // Validate email
      if (!to) {
        setError('Please enter a recipient email address');
        return;
      }

      if (!to.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate subject
      if (!subject.trim()) {
        setError('Please enter a subject');
        return;
      }

      // Get and validate content
      const content = editor.getHTML();
      if (!content || content === '<p></p>' || content === '<p><br></p>') {
        setError('Please enter a message');
        return;
      }
      
      setSending(true);

      try {
        const response = await fetch('/api/emails/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: to.trim(),
            subject: subject.trim(),
            content: content.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send email');
        }

        // Clear form and close modal on success
        setTo('');
        setSubject('');
        editor.commands.clearContent();
        onClose();
      } catch (apiError: any) {
        setError(apiError.message || 'Failed to send email. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setSending(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700/50 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between border-b border-gray-700/50 p-4 bg-gray-800/50 backdrop-blur-sm">
                  <Dialog.Title className="text-lg font-medium text-white flex items-center gap-2">
                    <span className="bg-blue-500/10 text-blue-400 p-1.5 rounded-lg">
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </span>
                    New Message
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-300 transition-colors p-1 hover:bg-gray-700/50 rounded-lg"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 animate-shake">
                      <div className="w-1 h-1 rounded-full bg-red-400"></div>
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="group">
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="To"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700/50 transition-all duration-200 group-hover:border-gray-600/50"
                        />
                        <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>
                    
                    <div className="group">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700/50 transition-all duration-200 group-hover:border-gray-600/50"
                        />
                        <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="group">
                      <div className="relative">
                        <div className="min-h-[300px] rounded-xl border border-gray-700/50 bg-gray-800/50 overflow-hidden transition-all duration-200 group-hover:border-gray-600/50">
                          <EditorContent editor={editor} />
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700/50 p-4 flex justify-end gap-3 bg-gray-800/30 backdrop-blur-sm">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-1 focus:ring-offset-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 focus:ring-offset-gray-800 flex items-center gap-2
                      ${sending ? 'bg-blue-500/50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4" />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 