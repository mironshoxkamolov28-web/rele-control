import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../components';
import { qrUrl } from '../relayHelpers.js';

export default function QrPreviewModal({ t, qrPreviewRelay, setQrPreviewRelay, printQRCode, getStationName }) {
  return (
    <Modal isOpen={!!qrPreviewRelay} onClose={() => setQrPreviewRelay(null)}>
      <div className="glass rounded-2xl p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-1">{t('qrPreview.title')}</h2>
        <p className="text-sm text-white/40 mb-5">{qrPreviewRelay?.name} — {qrPreviewRelay?.num}</p>
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-xl p-3">
            <QRCodeSVG value={qrPreviewRelay ? qrUrl(qrPreviewRelay) : ''} size={160} level="H" />
          </div>
        </div>
        <p className="text-xs text-white/40 mb-1">{t('qrPreview.stationLabel')} {getStationName(qrPreviewRelay?.stationId)}</p>
        <p className="text-xs text-white/30">{t('qrPreview.scanHint1')}</p>
        <p className="text-xs text-white/30 mb-5">{t('qrPreview.scanHint2')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => { printQRCode(qrPreviewRelay); setQrPreviewRelay(null); }}
            className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-5 py-2.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20">
            {t('common.qrDownload')}
          </button>
          <button onClick={() => setQrPreviewRelay(null)}
            className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20">
            {t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
