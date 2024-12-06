import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between border-b border-gray-700 p-4">
                  <Dialog.Title className="text-lg font-medium text-white">
                    New Message
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                        {error}
                      </div>
                    )}
                    <div>
                      <input
                        type="email"
                        placeholder="To"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="min-h-[200px] rounded-lg border border-gray-700 bg-gray-700">
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 p-4 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg transition-colors
                      ${sending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                  >
                    {sending ? 'Sending...' : 'Send'}
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