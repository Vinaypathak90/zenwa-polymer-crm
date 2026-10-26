const mongoose = require('mongoose');

const FlowSubmissionSchema = new mongoose.Schema({
    customerPhone: { type: String, required: true },
    customerName: { type: String, default: 'Anonymous Buyer' },
    company: { type: String, default: '' },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['New', 'Reviewed', 'Quote Sent', 'Order Placed'], default: 'New' }
});

const WhatsAppFlowSchema = new mongoose.Schema({
    name: { type: String, required: true },
    flowId: { type: String, required: true, unique: true },
    category: { type: String, enum: ['LEAD_GENERATION', 'CUSTOMER_SUPPORT', 'ORDER_MANAGEMENT', 'SURVEY'], default: 'LEAD_GENERATION' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'DEPRECATED'], default: 'PUBLISHED' },
    description: { type: String, default: '' },
    screensCount: { type: Number, default: 2 },
    submissionsCount: { type: Number, default: 0 },
    completionRate: { type: String, default: '88.5%' },
    screens: [
        {
            screenId: { type: String },
            title: { type: String },
            fields: [
                {
                    key: { type: String },
                    label: { type: String },
                    type: { type: String, enum: ['TextInput', 'Dropdown', 'Radio', 'Checkbox', 'DatePicker', 'NumberInput'] },
                    required: { type: Boolean, default: true },
                    options: [{ label: String, value: String }]
                }
            ]
        }
    ],
    submissions: [FlowSubmissionSchema]
}, { timestamps: true });

// Seed Data for Zenvista Polymers Flows
const defaultFlows = [
    {
        name: 'Instant Polymer Quotation & Tonnage Request',
        flowId: 'flow_poly_quote_001',
        category: 'LEAD_GENERATION',
        status: 'PUBLISHED',
        description: 'Interactive in-chat WhatsApp form for buyers to select polymer grade, quantity in MT, delivery location, and receive verified quote in seconds.',
        screensCount: 2,
        submissionsCount: 142,
        completionRate: '92.4%',
        screens: [
            {
                screenId: 'SCREEN_GRADE_QTY',
                title: 'Step 1: Select Grade & Volume',
                fields: [
                    {
                        key: 'polymer_grade',
                        label: 'Select Polymer Grade',
                        type: 'Dropdown',
                        required: true,
                        options: [
                            { label: 'HDPE Blow Molding Grade (B56003)', value: 'HDPE_B56003' },
                            { label: 'PP Homopolymer Injection Grade (H110MA)', value: 'PP_H110MA' },
                            { label: 'LLDPE Film Grade (010F18A)', value: 'LLDPE_010F18A' },
                            { label: 'PVC Resin Suspension (K-67)', value: 'PVC_K67' }
                        ]
                    },
                    {
                        key: 'tonnage',
                        label: 'Required Quantity (Metric Tons)',
                        type: 'NumberInput',
                        required: true
                    }
                ]
            },
            {
                screenId: 'SCREEN_LOGISTICS',
                title: 'Step 2: Delivery & GST Details',
                fields: [
                    {
                        key: 'delivery_hub',
                        label: 'Destination / Warehouse',
                        type: 'Dropdown',
                        required: true,
                        options: [
                            { label: 'Ex-Kandla Port Warehouse', value: 'Kandla' },
                            { label: 'Ex-Mundra Port Depot', value: 'Mundra' },
                            { label: 'FOT Ahmedabad / Dholka', value: 'Ahmedabad' },
                            { label: 'FOT Daman & Silvassa', value: 'Daman_Silvassa' }
                        ]
                    },
                    {
                        key: 'gstin',
                        label: 'Company GSTIN (For Proforma Invoice)',
                        type: 'TextInput',
                        required: false
                    }
                ]
            }
        ],
        submissions: [
            {
                customerPhone: '+91 98200 44120',
                customerName: 'Rajesh Patel',
                company: 'Gujarat Containers Ltd',
                answers: { polymer_grade: 'HDPE_B56003', tonnage: 15, delivery_hub: 'Kandla', gstin: '24AAACG1234F1Z5' },
                status: 'Quote Sent'
            },
            {
                customerPhone: '+91 98110 99823',
                customerName: 'Anil Gupta',
                company: 'Supreme Molding Corp',
                answers: { polymer_grade: 'PP_H110MA', tonnage: 28, delivery_hub: 'Ahmedabad', gstin: '24AAACS9981A1ZP' },
                status: 'Reviewed'
            }
        ]
    },
    {
        name: 'Sample Request & Technical Spec Sheet (COA)',
        flowId: 'flow_poly_sample_002',
        category: 'CUSTOMER_SUPPORT',
        status: 'PUBLISHED',
        description: 'Enables manufacturing lab heads to request 5kg polymer trial granules along with Melt Flow Index (MFI) and Density test reports.',
        screensCount: 2,
        submissionsCount: 78,
        completionRate: '86.1%',
        screens: [
            {
                screenId: 'SCREEN_SAMPLE',
                title: 'Lab Sample Specs',
                fields: [
                    {
                        key: 'product_interest',
                        label: 'Product Sample Needed',
                        type: 'Dropdown',
                        required: true,
                        options: [
                            { label: 'HDPE B56003 (Blow Grade)', value: 'HDPE' },
                            { label: 'PP H110MA (Injection MFI 11)', value: 'PP' }
                        ]
                    },
                    {
                        key: 'application_type',
                        label: 'End Application',
                        type: 'TextInput',
                        required: true
                    }
                ]
            }
        ],
        submissions: [
            {
                customerPhone: '+91 98765 12098',
                customerName: 'Vikram Joshi',
                company: 'Apex Packaging Industries',
                answers: { product_interest: 'HDPE', application_type: '20L Lube Oil Drums' },
                status: 'New'
            }
        ]
    }
];

WhatsAppFlowSchema.statics.seedIfEmpty = async function() {
    const count = await this.countDocuments();
    if (count === 0) {
        console.log('Seeding initial WhatsApp Flows...');
        await this.insertMany(defaultFlows);
    }
};

module.exports = mongoose.model('WhatsAppFlow', WhatsAppFlowSchema);
