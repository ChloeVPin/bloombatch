import { useState, useEffect } from 'react';
import './App.css';
import { GetFileInfos } from '../wailsjs/go/main/App';
import { OnFileDrop } from '../wailsjs/runtime/runtime';
import { main } from '../wailsjs/go/models';
// Custom logo SVG inline
import { Page, RuleConfig } from './types';
import DropPage from './pages/DropPage';
import RulesPage from './pages/RulesPage';
import PreviewPage from './pages/PreviewPage';
import DonePage from './pages/DonePage';

const stepLabels: Record<Page, string> = {
  drop: 'Add files',
  rules: 'Configure',
  preview: 'Preview',
  done: '',
};

function App() {
  const [page, setPage] = useState<Page>('drop');
  const [files, setFiles] = useState<main.FileInfo[]>([]);
  const [rules, setRules] = useState<RuleConfig[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Use Wails runtime OnFileDrop with useDropTarget=true
    // This listens for native file drops and checks for --wails-drop-target CSS property
    OnFileDrop((_x, _y, paths) => {
      GetFileInfos(paths).then((infos) => {
        if (infos && infos.length > 0) {
          setFiles((prev) => {
            const existing = new Set(prev.map((f) => f.fullPath));
            return [...prev, ...infos.filter((f) => !existing.has(f.fullPath))];
          });
        }
      });
    }, true);
  }, []);

  const handleFilesAdded = (infos: main.FileInfo[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.fullPath));
      return [...prev, ...infos.filter((f) => !existing.has(f.fullPath))];
    });
  };

  const startOver = () => {
    setPage('drop');
    setFiles([]);
    setRules([]);
    setDoneCount(0);
    setErrorMessage('');
  };

  return (
    <div className="flex flex-col h-screen select-none bg-surface">
      {/* Header */}
      <header className="flex items-center gap-2.5 px-6 py-4 border-b border-border">
        <svg width="20" height="20" viewBox="0 0 300 300" className="text-accent">
          <path d="M53.94199,0h192.23086c1.48682,0.44803 3.6958,0.59338 5.27783,0.82384c1.9292,0.29684 3.83789,0.71874 5.71289,1.26305c22.3418,6.31206 38.75684,24.63289 42.31348,47.76379c0.17871,1.16499 0.09814,2.62354 0.52295,3.69858v193.08062c-0.4248,1.3667 -0.57568,3.38965 -0.78809,4.84277c-0.28857,1.96436 -0.71924,3.90527 -1.2876,5.80664c-6.12451,20.97656 -22.41943,36.51123 -43.58496,41.35693c-1.29932,0.29883 -6.44971,0.96094 -7.12061,1.36377h-194.27065c-0.802,-0.35449 -5.23403,-0.95508 -6.43271,-1.229c-5.31548,-1.21436 -9.96152,-2.65723 -14.79785,-5.21191c-14.19316,-7.34619 -24.78916,-20.14746 -29.35386,-35.46387c-0.91302,-3.01904 -1.56136,-5.90771 -1.88607,-9.04834c-0.08608,-0.83203 -0.2061,-1.78711 -0.4776,-2.57666v-192.78896c0.32685,-0.73418 0.3273,-1.73232 0.41432,-2.53184c0.80553,-7.40171 3.51571,-15.21299 7.176,-21.59575c7.53126,-13.43525 20.12042,-23.3026 34.96588,-27.40594c2.08052,-0.58188 4.19487,-1.03505 6.33105,-1.35692c1.51392,-0.22018 3.65229,-0.37465 5.05474,-0.79081z" fill="currentColor"/>
          <path d="M147.24756,96.03281l10.70654,-6.20537c3.23584,-1.87808 7.94238,-4.97622 11.50195,-5.72432c6.75879,-1.42002 14.85059,3.4875 15.85254,10.54175c0.60938,4.29038 0.45117,8.81924 0.42773,13.15972c-0.0293,5.10352 0.16846,10.35161 -0.21094,15.42715c-0.13477,1.78931 -0.39697,3.5666 -0.78369,5.31855c-1.00195,4.53223 -2.87842,8.8251 -5.52686,12.63721c-6.58008,9.48193 -15.25342,14.60889 -26.46826,16.61133c0.15381,4.75781 -0.04102,9.97266 0.03076,14.79346c0.03369,2.22656 0.11133,7.96436 -0.13916,9.9375c11.66162,-17.73633 28.67725,-30.41162 50.04932,-33.97412c7.34912,-1.22607 14.77734,5.625 14.98389,12.67822c0.12598,4.27441 -2.14893,12.51416 -3.59473,16.69922c-5.82129,17.39355 -18.33252,31.75195 -34.76807,39.89795c-11.2793,5.27051 -20.46533,6.51709 -32.73486,6.30615c-6.31465,-0.1084 -9.75952,0.03516 -16.18652,-1.23779c-17.40747,-3.44971 -31.95952,-13.84863 -41.83403,-28.45166c-5.50723,-8.17822 -8.60068,-16.65381 -10.79238,-26.22803c-1.6834,-7.35205 -1.22812,-12.94043 5.48188,-17.68799c3.36724,-2.38184 7.25449,-2.40381 11.19653,-1.53809c20.12227,4.41504 36.19043,16.20996 47.31929,33.43506l0.02681,-24.65625c-6.49731,-1.00781 -11.73882,-2.93262 -17.05488,-6.89209c-8.08608,-6.02373 -14.08711,-14.82466 -15.45264,-24.93911c-0.68174,-6.02886 -0.53936,-12.33208 -0.47607,-18.41514c0.05698,-5.48555 -0.90513,-13.43789 2.50518,-17.94917c2.32939,-3.02124 5.73765,-5.02339 9.51064,-5.58721c5.89878,-0.63486 9.95215,2.47236 14.82876,5.30566z" fill="#fefefe"/>
        </svg>
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          bloombatch
        </span>
        {page !== 'done' && stepLabels[page] && (
          <span className="text-[11px] text-text-tertiary ml-auto uppercase tracking-widest">
            {stepLabels[page]}
          </span>
        )}
      </header>

      {/* Page content */}
      <div className="flex flex-col flex-1 min-h-0 py-4">
        {page === 'drop' && (
          <DropPage
            files={files}
            onFilesAdded={handleFilesAdded}
            onNext={() => setPage('rules')}
          />
        )}
        {page === 'rules' && (
          <RulesPage
            rules={rules}
            onRulesChange={setRules}
            onBack={() => setPage('drop')}
            onNext={() => setPage('preview')}
          />
        )}
        {page === 'preview' && (
          <PreviewPage
            files={files}
            rules={rules}
            onBack={() => setPage('rules')}
            onDone={(count) => { setDoneCount(count); setErrorMessage(''); setPage('done'); }}
            onError={(msg) => { setErrorMessage(msg); setPage('done'); }}
          />
        )}
        {page === 'done' && (
          <DonePage
            count={doneCount}
            errorMessage={errorMessage}
            onStartOver={startOver}
          />
        )}
      </div>
    </div>
  );
}

export default App;
