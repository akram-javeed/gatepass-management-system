// EMAIL SERVICE WITH COMPLETE WORKFLOW
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Main function to send application emails
  async sendApplicationEmail(recipientEmail, emailType, applicationData) {
    try {
      let subject = '';
      let htmlContent = '';

      switch (emailType) {
        case 'application_submitted':
          subject = `Gate Pass Application ${applicationData.loaNumber} - Received`;
          htmlContent = this.getSubmissionEmailTemplate(applicationData);
          break;

        case 'new_application_notification':
          subject = `New Gate Pass Application ${applicationData.loaNumber} - Action Required`;
          htmlContent = this.getNewApplicationNotificationTemplate(applicationData);
          break;

        case 'approval':
          subject = `Gate Pass Application ${applicationData.loaNumber} - Approved by ${applicationData.approvedBy}`;
          htmlContent = this.getApprovalEmailTemplate(applicationData);
          break;

        case 'rejection':
          subject = `Gate Pass Application ${applicationData.loaNumber} - Rejected by ${applicationData.rejectedBy}`;
          htmlContent = this.getRejectionEmailTemplate(applicationData);
          break;

        case 'forwarded_notification':
          subject = `Gate Pass Application ${applicationData.loaNumber} - Forwarded for Your Review`;
          htmlContent = this.getForwardedNotificationTemplate(applicationData);
          break;

        case 'pdf_sent':
          subject = `Gate Pass ${applicationData.loaNumber} - Approved and Ready`;
          htmlContent = this.getPDFReadyEmailTemplate(applicationData);
          break;

        case 'temp_pass_submitted':
          subject = `Temporary Gate Pass ${applicationData.tempPassNumber} - Received`;
          htmlContent = this.getTemporaryPassSubmissionTemplate(applicationData);
          break;

        case 'temp_pass_officer_notification':
          subject = `🚨 URGENT: Temporary Pass ${applicationData.tempPassNumber} - Immediate Action Required`;
          htmlContent = this.getTemporaryPassOfficerNotificationTemplate(applicationData);
          break;

        case 'temp_pass_chos_notification':
          subject = `🚨 PRIORITY DSC: Temporary Pass ${applicationData.tempPassNumber} Ready`;
          htmlContent = this.getTemporaryPassChOSNotificationTemplate(applicationData);
          break;

        case 'temp_pass_approved':
          subject = `✅ Temporary Gate Pass ${applicationData.tempPassNumber} - Approved`;
          htmlContent = this.getTemporaryPassApprovedTemplate(applicationData);
          break;

        default:
          throw new Error('Invalid email type');
      }

      const mailOptions = {
        from: `"Gate Pass System - Southern Railway" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
        attachments: applicationData.pdfPath ? [{
          filename: `gate-pass-${applicationData.loaNumber}.pdf`,
          path: applicationData.pdfPath
        }] : []
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${recipientEmail}:`, result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 1. Contractor submission confirmation
  getSubmissionEmailTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Gate Pass Application Received</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #2c5aa0; margin: 0;">🚅 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #28a745; margin: 10px 0 0 0;">Gate Pass Application Received</h3>
          </div>
          
          <p>Dear <strong>${data.contractorName || 'Contractor'}</strong>,</p>
          
          <p>Your gate pass application has been <strong>successfully received</strong> and is now under review.</p>
          
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #0c5460;">📋 Application Details:</h3>
            <p style="margin: 5px 0;"><strong>LOA Number:</strong> ${data.loaNumber}</p>
            <p style="margin: 5px 0;"><strong>Application ID:</strong> ${data.applicationId}</p>
            <p style="margin: 5px 0;"><strong>Firm Name:</strong> ${data.firmName}</p>
            <p style="margin: 5px 0;"><strong>Number of Persons:</strong> ${data.numberOfPersons}</p>
            <p style="margin: 5px 0;"><strong>Gate Pass Period:</strong> ${data.gatePassPeriod}</p>
            <p style="margin: 5px 0;"><strong>Current Status:</strong> <span style="color: #ffc107; font-weight: bold;">Pending with SSE</span></p>
            <p style="margin: 5px 0;"><strong>Submitted Date:</strong> ${data.submittedDate}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #ffc107;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">🔄 Review Process:</h4>
            <ol style="margin: 0; padding-left: 20px;">
              <li><strong>SSE Review</strong> - Your application will be reviewed by the executing SSE</li>
              <li><strong>Safety Officer Review</strong> - If approved, forwarded to Safety Officer</li>
              <li><strong>Technical Officer Review</strong> - Technical evaluation by designated officers</li>
              <li><strong>Final Approval</strong> - Ch.OS/NPB will provide final approval and generate gate pass</li>
            </ol>
          </div>
          
          <p>📧 You will receive email notifications at each stage of the review process.</p>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from the Gate Pass System.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong><br>
            Ayanavaram, Chennai - 600023
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // 2. New application notification for approvers (SSE, Safety, Officers, Ch.OS)
  getNewApplicationNotificationTemplate(data) {
    const actionUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/${data.userRole}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Gate Pass Application - Action Required</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; border-left: 5px solid #ffc107;">
            <h2 style="color: #856404; margin: 0;">🚅 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #dc3545; margin: 10px 0 0 0;">⚠️ Action Required - New Gate Pass Application</h3>
          </div>
          
          <p>Dear <strong>${data.approverName || data.userRole.toUpperCase()}</strong>,</p>
          
          <p>A new gate pass application requires your <strong>immediate attention</strong> and approval.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #007bff;">
            <h3 style="margin: 0 0 10px 0; color: #495057;">📋 Application Details:</h3>
            <p style="margin: 5px 0;"><strong>LOA Number:</strong> ${data.loaNumber}</p>
            <p style="margin: 5px 0;"><strong>Application ID:</strong> ${data.applicationId}</p>
            <p style="margin: 5px 0;"><strong>Firm Name:</strong> ${data.firmName}</p>
            <p style="margin: 5px 0;"><strong>Contractor Name:</strong> ${data.contractorName}</p>
            <p style="margin: 5px 0;"><strong>Number of Persons:</strong> ${data.numberOfPersons}</p>
            <p style="margin: 5px 0;"><strong>Gate Pass Period:</strong> ${data.gatePassPeriod}</p>
            <p style="margin: 5px 0;"><strong>Submitted Date:</strong> ${data.submittedDate}</p>
            <p style="margin: 5px 0;"><strong>Your Role:</strong> <span style="color: #dc3545; font-weight: bold;">${data.userRole.toUpperCase()}</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🔗 REVIEW APPLICATION NOW
            </a>
          </div>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #28a745;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">💼 Your Actions:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Review</strong> the application details carefully</li>
              <li><strong>Approve</strong> if all requirements are met</li>
              <li><strong>Reject</strong> with detailed remarks if issues are found</li>
              <li><strong>Forward</strong> to next level upon approval</li>
            </ul>
          </div>
          
          <p><strong>⏰ Please review this application promptly to avoid delays in the contractor's work schedule.</strong></p>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated notification from the Gate Pass System.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong><br>
            Ayanavaram, Chennai - 600023
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // 3. Approval notification to contractor
  getApprovalEmailTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Gate Pass Application Approved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 20px; border-left: 5px solid #28a745; text-align: center;">
            <h2 style="color: #155724; margin: 0;">🚅 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #155724; margin: 10px 0 0 0;">✅ Application Approved</h3>
          </div>
          
          <p>Dear <strong>${data.contractorName || 'Contractor'}</strong>,</p>
          
          <p><strong>Good news!</strong> Your gate pass application has been <strong>approved by ${data.approvedBy}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>LOA Number:</strong> ${data.loaNumber}</p>
            <p style="margin: 5px 0;"><strong>Application ID:</strong> ${data.applicationId}</p>
            <p style="margin: 5px 0;"><strong>Approved By:</strong> <span style="color: #28a745; font-weight: bold;">${data.approvedBy}</span></p>
            <p style="margin: 5px 0;"><strong>Current Status:</strong> <span style="color: #007bff; font-weight: bold;">${data.currentStatus}</span></p>
            <p style="margin: 5px 0;"><strong>Approved Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            ${data.remarks ? `<p style="margin: 5px 0;"><strong>Remarks:</strong> ${data.remarks}</p>` : ''}
          </div>
          
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #17a2b8;">
            <h4 style="margin: 0 0 10px 0; color: #0c5460;">🔄 Next Steps:</h4>
            <p style="margin: 0;">Your application will now proceed to the next stage of review. You will receive further notifications as the process continues.</p>
          </div>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from the Gate Pass System.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong><br>
            Ayanavaram, Chennai - 600023
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // 4. Rejection notification to contractor
  getRejectionEmailTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Gate Pass Application Rejected</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin-bottom: 20px; border-left: 5px solid #dc3545; text-align: center;">
            <h2 style="color: #721c24; margin: 0;">🚂 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #721c24; margin: 10px 0 0 0;">❌ Application Rejected</h3>
          </div>
          
          <p>Dear <strong>${data.contractorName || 'Contractor'}</strong>,</p>
          
          <p>We regret to inform you that your gate pass application has been <strong>rejected by ${data.rejectedBy}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>LOA Number:</strong> ${data.loaNumber}</p>
            <p style="margin: 5px 0;"><strong>Application ID:</strong> ${data.applicationId}</p>
            <p style="margin: 5px 0;"><strong>Rejected By:</strong> <span style="color: #dc3545; font-weight: bold;">${data.rejectedBy}</span></p>
            <p style="margin: 5px 0;"><strong>Rejected Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
          
          ${data.rejectionReason ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 3px solid #ffc107; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">📝 Rejection Reason:</h4>
              <p style="margin: 0; padding: 10px; background-color: white; border-radius: 3px;">${data.rejectionReason}</p>
            </div>
          ` : ''}
          
          <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #17a2b8;">
            <h4 style="margin: 0 0 10px 0; color: #0c5460;">📋 What's Next:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Please review the rejection reason carefully</li>
              <li>Address the mentioned issues in your application</li>
              <li>You may submit a new application with the corrected information</li>
              <li>Contact the concerned department if you need clarification</li>
            </ul>
          </div>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from the Gate Pass System.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong><br>
            Ayanavaram, Chennai - 600023
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // 5. Forwarded notification for next approver
  getForwardedNotificationTemplate(data) {
    const actionUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/${data.userRole}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Gate Pass Application Forwarded</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #e8f4f8; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; border-left: 5px solid #17a2b8;">
            <h2 style="color: #0c5460; margin: 0;">🚂 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #0c5460; margin: 10px 0 0 0;">📤 Application Forwarded for Your Review</h3>
          </div>
          
          <p>Dear <strong>${data.approverName || data.userRole.toUpperCase()}</strong>,</p>
          
          <p>A gate pass application has been <strong>approved by ${data.forwardedBy}</strong> and forwarded to you for review.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #007bff;">
            <h3 style="margin: 0 0 10px 0; color: #495057;">📋 Application Details:</h3>
            <p style="margin: 5px 0;"><strong>LOA Number:</strong> ${data.loaNumber}</p>
            <p style="margin: 5px 0;"><strong>Application ID:</strong> ${data.applicationId}</p>
            <p style="margin: 5px 0;"><strong>Firm Name:</strong> ${data.firmName}</p>
            <p style="margin: 5px 0;"><strong>Contractor Name:</strong> ${data.contractorName}</p>
            <p style="margin: 5px 0;"><strong>Number of Persons:</strong> ${data.numberOfPersons}</p>
            <p style="margin: 5px 0;"><strong>Gate Pass Period:</strong> ${data.gatePassPeriod}</p>
            <p style="margin: 5px 0;"><strong>Forwarded By:</strong> <span style="color: #28a745; font-weight: bold;">${data.forwardedBy}</span></p>
            <p style="margin: 5px 0;"><strong>Your Role:</strong> <span style="color: #dc3545; font-weight: bold;">${data.userRole.toUpperCase()}</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background-color: #17a2b8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🔗 REVIEW APPLICATION NOW
            </a>
          </div>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #28a745;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">✅ Previous Approval:</h4>
            <p style="margin: 0;">This application has been reviewed and approved by ${data.forwardedBy}. Please conduct your review and take appropriate action.</p>
          </div>
          
          <p><strong>⏰ Please review this application promptly to maintain the workflow efficiency.</strong></p>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated notification from the Gate Pass System.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong><br>
            Ayanavaram, Chennai - 600023
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // 6. Final approval with PDF attachment
  getPDFReadyEmailTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Gate Pass Ready for Download</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; margin-bottom: 20px; border-left: 5px solid #17a2b8; text-align: center;">
            <h2 style="color: #0c5460; margin: 0;">🚂 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #0c5460; margin: 10px 0 0 0;">🎉 Gate Pass Approved and Ready!</h3>
          </div>
          
          <p>Dear <strong>${data.contractorName || 'Contractor'}</strong>,</p>
          
          <p><strong>🎉 Congratulations!</strong> Your gate pass application has been <strong>fully approved</strong> and is now ready for use.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #495057;">📋 Gate Pass Details:</h3>
            <p style="margin: 5px 0;"><strong>LOA Number:</strong> ${data.loaNumber}</p>
            <p style="margin: 5px 0;"><strong>Gate Permit Number:</strong> <span style="color: #dc3545; font-weight: bold;">${data.gatePermitNumber}</span></p>
            <p style="margin: 5px 0;"><strong>Valid From:</strong> ${data.validFrom}</p>
            <p style="margin: 5px 0;"><strong>Valid To:</strong> ${data.validTo}</p>
            <p style="margin: 5px 0;"><strong>Number of Persons:</strong> ${data.numberOfPersons}</p>
            <p style="margin: 5px 0;"><strong>Final Approval By:</strong> Ch.OS/NPB</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #ffc107;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important Instructions:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Print the attached gate pass PDF</strong></li>
              <li><strong>Bring company/firm Identity Card (ID card) & Aadhar card</strong></li>
              <li>Gate entry is only valid with proper identification</li>
              <li>Follow all safety protocols while inside the premises</li>
              <li>Gate pass is valid only for the specified period and personnel count</li>
              <li>Report to the security gate with this gate pass</li>
            </ul>
          </div>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #28a745; text-align: center;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">📎 Gate Pass PDF Attached</h4>
            <p style="margin: 0; font-size: 14px;">The official gate pass PDF is attached to this email. Please download and print it for entry.</p>
          </div>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from the Gate Pass System.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong><br>
            Ayanavaram, Chennai - 600023
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // Temporary Pass - Application Submitted
  getTemporaryPassSubmissionTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Temporary Gate Pass Application Received</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; border-left: 5px solid #ffc107;">
            <h2 style="color: #2c5aa0; margin: 0;">🚅 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #f97316; margin: 10px 0 0 0;">⚡ Temporary Gate Pass - Application Received</h3>
          </div>
          
          <p>Dear <strong>${data.representativeName}</strong>,</p>
          
          <p>Your <strong>TEMPORARY</strong> gate pass application has been successfully received and is under priority processing.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #f97316;">
            <h3 style="margin: 0 0 10px 0; color: #f97316;">📋 Application Details:</h3>
            <p style="margin: 5px 0;"><strong>Pass Number:</strong> ${data.tempPassNumber}</p>
            <p style="margin: 5px 0;"><strong>Firm Name:</strong> ${data.firmName}</p>
            <p style="margin: 5px 0;"><strong>Nature of Work:</strong> ${data.natureOfWork}</p>
            <p style="margin: 5px 0;"><strong>Period:</strong> ${data.periodFrom} to ${data.periodTo}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> <span style="color: #dc2626; font-weight: bold;">${data.duration} day(s) only</span></p>
            <p style="margin: 5px 0;"><strong>Number of Persons:</strong> ${data.numberOfPersons}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f97316; font-weight: bold;">Forwarded to ${data.forwardedTo} for urgent approval</span></p>
          </div>
          
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #dc2626;">
            <h4 style="margin: 0 0 10px 0; color: #dc2626;">⚠️ IMPORTANT - Temporary Pass:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>This is a <strong>priority temporary pass</strong> valid for maximum 3 days</li>
              <li>Fast-track approval process is being followed</li>
              <li>You will receive the approved pass shortly</li>
              <li>All persons must carry valid ID proof</li>
            </ul>
          </div>
          
          <p>📧 You will receive email notification once your pass is approved.</p>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated priority message from the Gate Pass System.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong><br>
            Ayanavaram, Chennai - 600023
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // Temporary Pass - Officer Notification
  getTemporaryPassOfficerNotificationTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>URGENT: Temporary Gate Pass - Action Required</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; border-left: 5px solid #dc2626;">
            <h2 style="color: #2c5aa0; margin: 0;">🚅 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #dc2626; margin: 10px 0 0 0;">🚨 URGENT: Temporary Pass - Immediate Action Required</h3>
          </div>
          
          <p>Dear <strong>${data.officerName}</strong>,</p>
          
          <p style="color: #dc2626; font-weight: bold;">A TEMPORARY gate pass application requires your IMMEDIATE attention and approval.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #f97316;">
            <h3 style="margin: 0 0 10px 0; color: #f97316;">⚡ Priority Application Details:</h3>
            <p style="margin: 5px 0;"><strong>Pass Number:</strong> ${data.tempPassNumber}</p>
            <p style="margin: 5px 0;"><strong>Firm Name:</strong> ${data.firmName}</p>
            <p style="margin: 5px 0;"><strong>Representative:</strong> ${data.representativeName}</p>
            <p style="margin: 5px 0;"><strong>Contact:</strong> ${data.phoneNumber}</p>
            <p style="margin: 5px 0;"><strong>Nature of Work:</strong> ${data.natureOfWork}</p>
            <p style="margin: 5px 0;"><strong>Period:</strong> ${data.periodFrom} to ${data.periodTo}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> <span style="color: #dc2626; font-weight: bold;">${data.duration} day(s) ONLY</span></p>
            <p style="margin: 5px 0;"><strong>Number of Persons:</strong> ${data.numberOfPersons}</p>
            <p style="margin: 5px 0;"><strong>Your Role:</strong> <span style="color: #dc2626; font-weight: bold;">${data.userRole}</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/officer-dashboard" 
              style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🔗 REVIEW URGENT APPLICATION NOW
            </a>
          </div>
          
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #dc2626;">
            <h4 style="margin: 0 0 10px 0; color: #dc2626;">⚠️ URGENT PROCESSING REQUIRED:</h4>
            <p style="margin: 0;">This is a <strong>temporary pass for urgent work</strong>. Please process this application <strong>IMMEDIATELY</strong> to avoid delays in critical work.</p>
          </div>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated PRIORITY notification from the Gate Pass System.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong><br>
            Ayanavaram, Chennai - 600023
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // Temporary Pass - Ch.OS/NPB Priority Notification
  getTemporaryPassChOSNotificationTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PRIORITY DSC: Temporary Gate Pass</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; border-left: 5px solid #dc2626;">
            <h2 style="color: #2c5aa0; margin: 0;">🚅 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #dc2626; margin: 10px 0 0 0;">⚡ PRIORITY DSC Processing Required</h3>
          </div>
          
          <p>Dear <strong>${data.chosName}</strong>,</p>
          
          <p style="color: #dc2626; font-weight: bold;">A temporary gate pass has been approved by ${data.approvedBy} and requires IMMEDIATE DSC processing.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #f97316;">📋 Temporary Pass Details:</h3>
            <p style="margin: 5px 0;"><strong>Pass Number:</strong> ${data.tempPassNumber}</p>
            <p style="margin: 5px 0;"><strong>Firm:</strong> ${data.firmName}</p>
            <p style="margin: 5px 0;"><strong>Representative:</strong> ${data.representativeName}</p>
            <p style="margin: 5px 0;"><strong>Period:</strong> ${data.periodFrom} to ${data.periodTo}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> <span style="color: #dc2626;">${data.duration} day(s) only</span></p>
            <p style="margin: 5px 0;"><strong>Officer Remarks:</strong> ${data.remarks || 'None'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/chos-dashboard" 
              style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              🔗 PROCESS DSC NOW
            </a>
          </div>
          
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626;"><strong>⚠️ PRIORITY:</strong> This temporary pass needs immediate DSC processing for urgent work.</p>
          </div>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is a PRIORITY notification from the Gate Pass System.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // Temporary Pass - Final Approved
  getTemporaryPassApprovedTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Temporary Gate Pass Approved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; border-left: 5px solid #28a745;">
            <h2 style="color: #2c5aa0; margin: 0;">🚅 SOUTHERN RAILWAY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Carriage and Wagon Works, Perambur</p>
            <h3 style="color: #28a745; margin: 10px 0 0 0;">✅ Temporary Gate Pass Approved</h3>
          </div>
          
          <p>Dear <strong>${data.representativeName}</strong>,</p>
          
          <p>Your <strong>temporary gate pass</strong> has been approved and is ready for use.</p>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #155724;">✅ Approved Pass Details:</h3>
            <p style="margin: 5px 0;"><strong>Permit Number:</strong> <span style="color: #dc2626; font-weight: bold;">${data.permitNumber}</span></p>
            <p style="margin: 5px 0;"><strong>Pass Number:</strong> ${data.tempPassNumber}</p>
            <p style="margin: 5px 0;"><strong>Valid From:</strong> ${data.periodFrom}</p>
            <p style="margin: 5px 0;"><strong>Valid To:</strong> ${data.periodTo}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> <span style="color: #dc2626;">${data.duration} day(s) only</span></p>
            <p style="margin: 5px 0;"><strong>Number of Persons:</strong> ${data.numberOfPersons}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 3px solid #ffc107;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important Instructions:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>This is a temporary pass valid for ${data.duration} day(s) only</strong></li>
              <li>Print this gate pass and carry it with you</li>
              <li>All persons must carry valid ID proof (Aadhar card)</li>
              <li>Entry is strictly during the approved period only</li>
              <li>Report to security gate with this pass</li>
            </ul>
          </div>
          
          <hr style="border: none; height: 1px; background-color: #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message with digitally signed gate pass.<br>
            <strong>Southern Railway - Carriage and Wagon Works, Perambur</strong><br>
            Ayanavaram, Chennai - 600023
          </p>
        </div>
      </body>
      </html>
    `;
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();