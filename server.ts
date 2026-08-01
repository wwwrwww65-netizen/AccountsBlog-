import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Dynamic Standalone Receipt Card Page
  app.get('/receipt', (req, res) => {
    const { id, name, role, type, amount, date, notes, remaining, salary } = req.query;

    const txTypeLabel = type === 'salary_pay' ? 'تسليم راتب شهري' :
                        type === 'advance_pay' ? 'سلفة مالية (خصم)' :
                        'مكافأة وبونص مميز';

    const cleanName = name || 'موظف كريم';
    const cleanRole = role || 'موظف';
    const cleanAmount = parseFloat(amount as string || '0').toLocaleString('ar-EG');
    const cleanRemaining = parseFloat(remaining as string || '0').toLocaleString('ar-EG');
    const cleanSalary = parseFloat(salary as string || '0').toLocaleString('ar-EG');
    const cleanDate = date || new Date().toLocaleDateString('ar-EG');
    const cleanNotes = notes || 'سند مالي معتمد ومسجل إلكترونياً';
    const cleanId = id || 'TX-' + Math.floor(Math.random() * 1000000);

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>سند مالي رسمي - ${cleanName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Cairo', sans-serif;
            color: #1e293b;
            background-color: #0f172a;
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 95vh;
            direction: rtl;
          }
          .receipt-container {
            width: 100%;
            max-width: 500px;
            background: #1e293b;
            border: 2px dashed #10b981;
            border-radius: 28px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            border-color: #10b981;
            position: relative;
            color: #f1f5f9;
          }
          .badge {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            font-size: 10px;
            font-weight: 800;
            padding: 4px 12px;
            border-radius: 12px;
            border: 1px solid rgba(16, 185, 129, 0.25);
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #334155;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .header h1 {
            color: #10b981;
            margin: 0;
            font-size: 20px;
            font-weight: 900;
          }
          .header p {
            color: #94a3b8;
            margin: 6px 0 0 0;
            font-size: 11px;
            font-weight: 700;
          }
          .receipt-title {
            text-align: center;
            font-size: 15px;
            font-weight: 800;
            background-color: #10b981;
            color: #0f172a;
            padding: 6px 18px;
            border-radius: 10px;
            display: inline-block;
            margin-bottom: 20px;
          }
          .center-wrapper {
            text-align: center;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 13px;
          }
          .label {
            color: #94a3b8;
            font-weight: 700;
          }
          .value {
            color: #f1f5f9;
            font-weight: 800;
          }
          .divider {
            border-top: 1px solid #334155;
            margin: 18px 0;
          }
          .section-title {
            color: #10b981;
            font-size: 13px;
            font-weight: 800;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .amount-box {
            background-color: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            padding: 12px;
            border-radius: 14px;
            margin: 15px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .amount-label {
            color: #34d399;
            font-weight: 800;
            font-size: 13px;
          }
          .amount-value {
            color: #10b981;
            font-size: 18px;
            font-weight: 900;
          }
          .balance-box {
            background-color: #0f172a;
            border: 1px solid #334155;
            padding: 14px;
            border-radius: 16px;
            margin-top: 15px;
          }
          .balance-box .row {
            margin-bottom: 8px;
          }
          .balance-box .row:last-child {
            margin-bottom: 0;
            padding-top: 8px;
            border-top: 1px dashed #334155;
          }
          .footer {
            text-align: center;
            margin-top: 25px;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #334155;
            padding-top: 15px;
          }
          .print-btn {
            background: #10b981;
            color: #0f172a;
            border: none;
            padding: 10px 20px;
            font-family: 'Cairo', sans-serif;
            font-weight: 800;
            font-size: 12px;
            border-radius: 10px;
            cursor: pointer;
            width: 100%;
            margin-top: 15px;
            transition: all 0.2s;
          }
          .print-btn:hover {
            background: #059669;
          }
          @media print {
            body {
              background: #fff;
              color: #000;
              padding: 0;
            }
            .receipt-container {
              box-shadow: none;
              border: 2px dashed #000;
              background: #fff;
              color: #000;
            }
            .value { color: #000; }
            .label { color: #475569; }
            .amount-box {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
            }
            .amount-value { color: #000; }
            .balance-box {
              background: #fff;
              border: 1px solid #cbd5e1;
            }
            .print-btn, .badge { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="badge">سند رقمي</div>
          
          <div class="header">
            <h1>مدونة الحسابات المتقدمة</h1>
            <p>سند مالي معتمد للعمال والرواتب</p>
          </div>

          <div class="center-wrapper">
            <div class="receipt-title">سند قيد رسمي</div>
          </div>

          <div class="row">
            <span class="label">رقم القيد:</span>
            <span class="value">${cleanId}</span>
          </div>
          <div class="row">
            <span class="label">تاريخ السند:</span>
            <span class="value">${cleanDate}</span>
          </div>

          <div class="divider"></div>

          <div class="section-title">👤 بيانات الموظف المستلم</div>
          <div class="row">
            <span class="label">اسم الموظف:</span>
            <span class="value">${cleanName}</span>
          </div>
          <div class="row">
            <span class="label">المسمى الوظيفي:</span>
            <span class="value">${cleanRole}</span>
          </div>

          <div class="divider"></div>

          <div class="section-title">📝 تفاصيل العملية المالية</div>
          <div class="row">
            <span class="label">نوع الحركة:</span>
            <span class="value">${txTypeLabel}</span>
          </div>
          <div class="row">
            <span class="label">البيان:</span>
            <span class="value">${cleanNotes}</span>
          </div>

          <div class="amount-box">
            <span class="amount-label">المبلغ المقيد:</span>
            <span class="amount-value">${cleanAmount} ريال سعودي</span>
          </div>

          <div class="divider"></div>

          <div class="section-title">📊 الوضعية والملخص المالي</div>
          <div class="balance-box">
            <div class="row">
              <span class="label">الراتب الشهري الأساسي:</span>
              <span class="value">${cleanSalary} ريال</span>
            </div>
            <div class="row">
              <span class="label">صافي الراتب المستحق والمتبقي:</span>
              <span class="value" style="color: #34d399; font-weight: 900;">${cleanRemaining} ريال سعودي</span>
            </div>
          </div>

          <button class="print-btn" onclick="window.print()">طباعة السند / حفظ كـ PDF</button>

          <div class="footer">
            <p>مدونة الحسابات المتقدمة - نظام الحسابات وإدارة شؤون العمال الذكي</p>
          </div>
        </div>
      </body>
      </html>
    `;
    res.send(html);
  });

  // Real WhatsApp Gateway Proxy API
  app.get('/api/whatsapp/qr', async (req, res) => {
    try {
      const { instanceId, token } = req.query;
      if (!instanceId || !token) {
        return res.status(400).send('Instance ID and Token are required');
      }
      console.log(`[WhatsApp API Proxy] Fetching QR for instance: ${instanceId}`);
      const response = await fetch(`https://api.ultramsg.com/${instanceId}/instance/qr?token=${token}`);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/png');
        return res.send(Buffer.from(buffer));
      } else {
        const text = await response.text();
        return res.status(response.status).send(text);
      }
    } catch (err: any) {
      console.error('[WhatsApp QR Proxy Error]', err);
      return res.status(500).send(err.message || 'Error fetching QR code');
    }
  });

  app.get('/api/whatsapp/status', async (req, res) => {
    try {
      const { instanceId, token } = req.query;
      if (!instanceId || !token) {
        return res.status(400).json({ success: false, error: 'Instance ID and Token are required' });
      }
      console.log(`[WhatsApp API Proxy] Checking status for instance: ${instanceId}`);
      const response = await fetch(`https://api.ultramsg.com/${instanceId}/instance/status?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        return res.json({ success: true, status: data });
      } else {
        const text = await response.text();
        return res.status(response.status).json({ success: false, error: text });
      }
    } catch (err: any) {
      console.error('[WhatsApp Status Proxy Error]', err);
      return res.status(500).json({ success: false, error: err.message || 'Error checking status' });
    }
  });

  app.post('/api/whatsapp/send', async (req, res) => {
    try {
      const { gatewayType, apiUrl, token, instanceId, phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({ success: false, error: 'رقم الهاتف والرسالة مطلوبان' });
      }

      console.log(`[WhatsApp API Proxy] Sending to ${phone} using gateway ${gatewayType}`);

      if (gatewayType === 'ultramsg') {
        // UltraMsg API integration
        const cleanApiUrl = apiUrl?.trim() || `https://api.ultramsg.com/${instanceId?.trim()}/messages/chat`;
        
        const response = await fetch(cleanApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: token?.trim() || '',
            to: phone.trim(),
            body: message,
          }),
        });

        const textResult = await response.text();
        if (response.ok) {
          try {
            return res.json({ success: true, response: JSON.parse(textResult) });
          } catch {
            return res.json({ success: true, response: textResult });
          }
        } else {
          return res.status(response.status).json({ success: false, error: textResult });
        }
      } else if (gatewayType === 'custom_get') {
        // Custom GET Gateway
        if (!apiUrl) {
          return res.status(400).json({ success: false, error: 'رابط الـ API مطلوب للبوابة المخصصة' });
        }
        
        let targetUrl = apiUrl
          .replace('{phone}', encodeURIComponent(phone.trim()))
          .replace('{message}', encodeURIComponent(message))
          .replace('{token}', encodeURIComponent(token?.trim() || ''));

        const response = await fetch(targetUrl, { method: 'GET' });
        const textResult = await response.text();

        if (response.ok) {
          return res.json({ success: true, response: textResult });
        } else {
          return res.status(response.status).json({ success: false, error: textResult });
        }
      } else if (gatewayType === 'custom_post') {
        // Custom POST Gateway
        if (!apiUrl) {
          return res.status(400).json({ success: false, error: 'رابط الـ API مطلوب للبوابة المخصصة' });
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phone.trim(),
            phone: phone.trim(),
            message: message,
            text: message,
            body: message,
            token: token?.trim() || '',
          }),
        });

        const textResult = await response.text();
        if (response.ok) {
          try {
            return res.json({ success: true, response: JSON.parse(textResult) });
          } catch {
            return res.json({ success: true, response: textResult });
          }
        } else {
          return res.status(response.status).json({ success: false, error: textResult });
        }
      } else {
        return res.status(400).json({ success: false, error: 'نوع البوابة غير معروف' });
      }
    } catch (error: any) {
      console.error('[WhatsApp API Proxy Error]', error);
      return res.status(500).json({ success: false, error: error.message || 'حدث خطأ داخلي في الخادم أثناء الإرسال' });
    }
  });

  // Vite Integration for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] running on http://localhost:${PORT}`);
  });
}

startServer();
