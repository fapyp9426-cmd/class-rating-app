// ===================== ПЕЧАТЬ / PDF =====================
import { getStudents } from './state.js';
import { escapeHtml } from './utils.js';

const optTitle = document.getElementById('print-opt-title');
const optDate = document.getElementById('print-opt-date');
const optEmoji = document.getElementById('print-opt-emoji');
const optLast = document.getElementById('print-opt-last');
const optHistory = document.getElementById('print-opt-history');
const optSign = document.getElementById('print-opt-sign');
const triggerPrintBtn = document.getElementById('trigger-print-btn');
const pdfPreviewBox = document.getElementById('pdf-preview-box');

const printChoiceModal = document.getElementById('print-choice-modal');
const closePrintChoiceBtn = document.getElementById('close-print-choice-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const openPrintBtn = document.getElementById('open-print-btn');

// Сборка верстки печати
function buildPrintHTML() {
  const students = getStudents();
  const titleText = optTitle ? optTitle.value.trim() || 'Отчет: Рейтинг класса' : 'Отчет: Рейтинг класса';
  const showDate = optDate ? optDate.checked : true;
  const showEmoji = optEmoji ? optEmoji.checked : true;
  const showLast = optLast ? optLast.checked : true;
  const showHistory = optHistory ? optHistory.checked : false;
  const showSign = optSign ? optSign.checked : true;

  const now = new Date();
  const dateStr = showDate ? `Сформировано: ${now.toLocaleDateString('ru-RU')} в ${now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}` : '';

  let headHTML = '<th>Место</th><th>Ученик</th><th>Баллы</th>';
  if (showLast) headHTML += '<th>Последнее действие</th>';
  if (showHistory) headHTML += '<th>Вся история</th>';

  let bodyHTML = '';
  students.forEach((s, index) => {
    const displayName = showEmoji ? `${escapeHtml(s.avatar)} ${escapeHtml(s.name)}` : escapeHtml(s.name);
    const lastAction = s.history && s.history.length > 0 ? s.history[s.history.length - 1] : null;

    let row = `<tr><td><strong>#${index + 1}</strong></td><td>${displayName}</td><td><strong>${s.score}</strong></td>`;

    if (showLast) {
      row += `<td>${lastAction ? `${escapeHtml(lastAction.reason)} (${lastAction.delta > 0 ? '+' : ''}${lastAction.delta})` : '—'}</td>`;
    }

    if (showHistory) {
      const allHist = (s.history || []).map(h => `${escapeHtml(h.reason)} (${h.delta > 0 ? '+' : ''}${h.delta})`).join('; ');
      row += `<td>${allHist || '—'}</td>`;
    }

    row += '</tr>';
    bodyHTML += row;
  });

  return { titleText: escapeHtml(titleText), dateStr, headHTML, bodyHTML, showSign };
}

export function updatePrintPreview() {
  const data = buildPrintHTML();

  const printTitle = document.getElementById('print-title');
  const printDate = document.getElementById('print-date');
  const printTableHead = document.getElementById('print-table-head');
  const printTableBody = document.getElementById('print-table-body');
  const printFooterSign = document.getElementById('print-footer-sign');

  if (printTitle) printTitle.textContent = optTitle ? optTitle.value.trim() || 'Отчет: Рейтинг класса' : 'Отчет: Рейтинг класса';
  if (printDate) {
    printDate.textContent = data.dateStr;
    printDate.style.display = data.dateStr ? 'block' : 'none';
  }
  if (printTableHead) printTableHead.innerHTML = data.headHTML;
  if (printTableBody) printTableBody.innerHTML = data.bodyHTML;
  if (printFooterSign) printFooterSign.style.display = data.showSign ? 'flex' : 'none';

  if (pdfPreviewBox) {
    pdfPreviewBox.innerHTML = `
      <h4 style="text-align: center; margin-bottom: 4px;">${data.titleText}</h4>
      ${data.dateStr ? `<div style="text-align: center; font-size: 9px; color: #666; margin-bottom: 10px;">${data.dateStr}</div>` : '<div style="margin-bottom: 10px;"></div>'}
      <table>
        <thead><tr>${data.headHTML}</tr></thead>
        <tbody>${data.bodyHTML}</tbody>
      </table>
      ${data.showSign ? '<div style="margin-top: 15px; font-size: 9px;">Подпись учителя: __________________ / __________________ /</div>' : ''}
    `;
  }
}

export function initPrint() {
  // Настройки печати — любое изменение сразу обновляет превью
  [optTitle, optDate, optEmoji, optLast, optHistory, optSign].forEach(el => {
    if (el) {
      el.addEventListener('input', updatePrintPreview);
      el.addEventListener('change', updatePrintPreview);
    }
  });

  if (triggerPrintBtn) {
    triggerPrintBtn.addEventListener('click', () => {
      updatePrintPreview();
      if (printChoiceModal) {
        printChoiceModal.classList.remove('hidden');
      } else {
        window.print();
      }
    });
  }

  if (openPrintBtn) {
    openPrintBtn.addEventListener('click', () => {
      if (printChoiceModal) printChoiceModal.classList.add('hidden');
      window.print();
    });
  }

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      if (printChoiceModal) printChoiceModal.classList.add('hidden');

      const titleText = optTitle ? optTitle.value.trim() || 'Отчет_Рейтинг_класса' : 'Отчет_Рейтинг_класса';

      if (typeof html2pdf !== 'undefined') {
        const data = buildPrintHTML();
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.background = '#ffffff';
        container.style.color = '#000000';
        container.style.fontFamily = 'sans-serif';
        container.innerHTML = `
          <h2 style="text-align: center; margin-bottom: 4px;">${data.titleText}</h2>
          ${data.dateStr ? `<div style="text-align: center; font-size: 11px; color: #666; margin-bottom: 16px;">${data.dateStr}</div>` : ''}
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead><tr style="background: #f2f2f2;">${data.headHTML}</tr></thead>
            <tbody>${data.bodyHTML}</tbody>
          </table>
          ${data.showSign ? '<div style="margin-top: 30px; font-size: 11px;">Подпись учителя: __________________ / __________________ /</div>' : ''}
        `;

        // Применяем границы к таблице
        container.querySelectorAll('th, td').forEach(cell => {
          cell.style.border = '1px solid #ccc';
          cell.style.padding = '8px';
          cell.style.fontSize = '12px';
        });

        const opt = {
          margin: 10,
          filename: `${titleText.replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(container).save();
      } else {
        window.print();
      }
    });
  }

  if (closePrintChoiceBtn) {
    closePrintChoiceBtn.onclick = () => printChoiceModal.classList.add('hidden');
  }
}
// ===================== /ПЕЧАТЬ / PDF =====================
