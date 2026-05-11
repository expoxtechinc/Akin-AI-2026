/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Chat from './components/Chat';

export default function App() {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#050505] font-sans antialiased text-[#E5E7EB] selection:bg-violet-500/30">
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full bg-[#050505] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden relative border-x border-white/5">
        <Chat />
      </main>
    </div>
  );
}
