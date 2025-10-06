// src/pages/AddProduct.jsx
import React, { useState } from 'react';
import { Plus, X, ExternalLink, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { app } from '../../../../../auth/httpAPI';

/* ----------  UTILITY  ---------- */
const cn = (...classes) => classes.filter(Boolean).join(' ');

/* ----------  BUTTON  ---------- */
const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled,
  type = 'button',
  onClick,
  asChild,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-emerald-700 text-white hover:bg-emerald-800',
    outline: 'border border-gray-300 bg-white hover:bg-emerald-50 text-black',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'hover:bg-emerald-50 text-black',
    success: 'bg-emerald-700 text-white hover:bg-emerald-800',
  };
  const sizes = {
    default: 'h-9 py-2 px-4 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-11 px-6 text-base',
    icon: 'h-9 w-9',
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(baseStyles, variants[variant], sizes[size], className),
      ...props,
    });
  }

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

/* ----------  INPUT  ---------- */
const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black',
      'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

/* ----------  TEXTAREA  ---------- */
const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black',
      'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

/* ----------  LABEL  ---------- */
const Label = ({ children, htmlFor, className }) => (
  <label
    htmlFor={htmlFor}
    className={cn('text-xs font-medium text-black mb-1.5 block', className)}
  >
    {children}
  </label>
);

/* ----------  CARD  ---------- */
const Card = ({ children, className }) => (
  <div className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
    {children}
  </div>
);
const CardHeader = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-1 p-5 pb-4', className)}>{children}</div>
);
const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-base font-semibold text-black', className)}>{children}</h3>
);
const CardDescription = ({ children, className }) => (
  <p className={cn('text-xs text-gray-500 mt-0.5', className)}>{children}</p>
);
const CardContent = ({ children, className }) => (
  <div className={cn('p-5 pt-0', className)}>{children}</div>
);

/* ----------  SELECT  ---------- */
const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  React.useEffect(() => setSelectedValue(value), [value]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onDocClick = () => setIsOpen(false);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [isOpen]);

  const handleSelect = (val) => {
    setSelectedValue(val);
    onValueChange?.(val);
    setIsOpen(false);
  };
  

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger)
          return React.cloneElement(child, {
            onClick: (e) => { e.stopPropagation(); setIsOpen(!isOpen); },
            isOpen,
            selectedValue
          });
        if (child.type === SelectContent && isOpen)
          return React.cloneElement(child, {
            onSelect: handleSelect
          });
        return null;
      })}
    </div>
  );
};
const SelectTrigger = ({ children, onClick, isOpen, selectedValue, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black',
      'focus:outline-none focus:ring-2 focus:ring-emerald-500',
      className
    )}
  >
    {React.Children.map(children, (child) =>
      child.type === SelectValue ? React.cloneElement(child, { value: selectedValue }) : child
    )}
    <span className={cn('text-gray-400 text-xs transition-transform', isOpen && 'rotate-180')}>▼</span>
  </button>
);
const SelectValue = ({ value, placeholder }) => (
  <span className={!value ? 'text-gray-400' : 'text-black'}>{value || placeholder || 'Select...'}</span>
);
const SelectContent = ({ children, onSelect }) => (
  <div
    className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto"
    onClick={(e) => e.stopPropagation()}
  >
    {React.Children.map(children, (child) => React.cloneElement(child, { onSelect }))}
  </div>
);
const SelectItem = ({ value, children, onSelect }) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      onSelect?.(value);
    }}
    className="px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer text-black"
  >
    {children}
  </div>
);

/* ----------  CHECKBOX  ---------- */
const Checkbox = ({ checked, onCheckedChange, id }) => (
  <input
    type="checkbox"
    id={id}
    checked={!!checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
  />
);

/* ----------  BADGE  ---------- */
const Badge = ({ children, variant = 'default', className, onClick }) => {
  const variants = {
    default: 'bg-emerald-700 text-white hover:bg-emerald-800',
    outline: 'border border-gray-300 text-black hover:bg-emerald-50',
  };
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
        variants[variant],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </span>
  );
};

/* ----------  TOAST  ---------- */
const Toast = ({ message, type = 'info' }) => {
  const types = {
    success: 'bg-emerald-50 text-black border-emerald-200',
    error: 'bg-rose-50 text-black border-rose-200',
    info: 'bg-emerald-50 text-black border-emerald-200',
  };
  return (
    <div className={cn('fixed top-4 right-4 p-4 rounded-lg border shadow-lg z-50', types[type])}>
      {message}
    </div>
  );
};

/* ----------  CHIP INPUT  ---------- */
const ChipInput = ({ label, chips, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const addChip = () => {
    if (input.trim() && !chips.includes(input.trim())) {
      onChange([...chips, input.trim()]);
      setInput('');
    }
  };
  const removeChip = (index) => onChange(chips.filter((_, i) => i !== index));
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {chips.map((chip, index) => (
          <Badge key={index} variant="default">
            {chip}
            <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeChip(index)} />
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChip())}
          placeholder={placeholder}
        />
        <Button type="button" onClick={addChip} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

/* ----------  REPEATABLE FIELD  ---------- */
const RepeatableField = ({ label, fields, onChange, placeholder }) => {
  const addField = () => onChange([...(fields || []), '']);
  const removeField = (index) => onChange(fields.filter((_, i) => i !== index));
  const updateField = (index, value) => {
    const updated = [...fields];
    updated[index] = value;
    onChange(updated);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addField}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={field}
              onChange={(e) => updateField(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button type="button" variant="destructive" size="icon" onClick={() => removeField(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ----------  HERB FIELD (UI)  ---------- */
const HerbField = ({ herbs, onChange }) => {
  const addHerb = () => onChange([...(herbs || []), { herbName: '', imgUrl: '' }]);
  const removeHerb = (index) => onChange(herbs.filter((_, i) => i !== index));
  const updateHerb = (index, field, value) => {
    const updated = [...herbs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Key Herbs</Label>
        <Button type="button" variant="outline" size="sm" onClick={addHerb}>
          <Plus className="h-4 w-4 mr-1" />
          Add Herb
        </Button>
      </div>
      <div className="space-y-3">
        {herbs.map((herb, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Herb Name</Label>
                  <Input
                    value={herb.herbName}
                    onChange={(e) => updateHerb(index, 'herbName', e.target.value)}
                    placeholder="Ashwagandha"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Image URL (optional)</Label>
                  <Input
                    value={herb.imgUrl}
                    onChange={(e) => updateHerb(index, 'imgUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeHerb(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ----------  PRODUCT SUMMARY  ---------- */
const ProductSummary = ({ title, slug, mrp, sellingPrice, stock, status, isSubmitting, onReset }) => {
  const discount = mrp && sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  return (
    <div className="sticky top-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500">Title</Label>
            <p className="font-medium text-black">{title || 'Untitled'}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Slug</Label>
            <p className="font-mono text-sm text-gray-600">{slug || 'no-slug'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">MRP</Label>
              <p className="font-medium text-black">₹{mrp?.toFixed?.(2) ?? Number(mrp || 0).toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Selling Price</Label>
              <p className="font-medium text-black">₹{sellingPrice?.toFixed?.(2) ?? Number(sellingPrice || 0).toFixed(2)}</p>
            </div>
          </div>
          {discount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
              <p className="text-sm font-medium text-black">{discount}% OFF</p>
            </div>
          )}
          <div>
            <Label className="text-xs text-gray-500">Stock</Label>
            <p className={cn('font-medium text-black', stock < 10 && 'text-black')}>{stock || 0} units</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Status</Label>
            <Badge variant={status === 'ACTIVE' ? 'default' : 'outline'}>{status || 'DRAFT'}</Badge>
          </div>
          <div className="pt-4 space-y-2">
            <Button type="submit" className="w-full" variant="success" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Product
                </>
              )}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ----------  HELPERS: build clean ProductDto payload  ---------- */
const isEmpty = (v) =>
  v === null ||
  v === undefined ||
  (typeof v === "string" && v.trim() === "") ||
  (Array.isArray(v) && v.length === 0);

const trimVal = (v) => (typeof v === "string" ? v.trim() : v);

function buildProductPayload(formData) {
  const base = {
    slug: trimVal(formData.slug),
    status: formData.status,
    productImg: trimVal(formData.productImg || ""),
    indication: trimVal(formData.indication || ""),
    qtySize: Number(formData.qtySize ?? 0),
    qtyUnit: formData.qtyUnit,
    courseTime: formData.courseTime ? Number(formData.courseTime) : null,
    mrp: formData.mrp != null ? Number(formData.mrp) : null,
    sellingPrice: formData.sellingPrice != null ? Number(formData.sellingPrice) : null,
    stock: formData.stock != null ? Number(formData.stock) : 0,
    tags: Array.isArray(formData.tags) ? formData.tags : [],
    tagsEn: (formData.tagsEn || []).map(trimVal).filter(Boolean),
    labReport: trimVal(formData.labReport || ""),
    title: trimVal(formData.title || ""),
    subtitle: trimVal(formData.subtitle || ""),
    tagline: trimVal(formData.tagline || ""),
    longDesc: trimVal(formData.longDesc || ""),

    whyChoose: (formData.whyChoose || []).map(trimVal).filter(Boolean),
    keyBenefits: (formData.keyBenefits || []).map(trimVal).filter(Boolean),
    howItWorks: (formData.howItWorks || []).map(trimVal).filter(Boolean),
    safetyFirst: (formData.safetyFirst || []).map(trimVal).filter(Boolean),
    idealFor: (formData.idealFor || []).map(trimVal).filter(Boolean),
    usage: (formData.usage || []).map(trimVal).filter(Boolean),
    precautionsWarnings: (formData.precautionsWarnings || []).map(trimVal).filter(Boolean),
    trustBadges: (formData.trustBadges || []).map(trimVal).filter(Boolean),
    trustBadgestag: (formData.trustBadgestag || []).map(trimVal).filter(Boolean),

    // Map UI herbs -> DTO (string list)
    keyherbs: (formData.keyherbs || [])
      .map((h) => trimVal(h?.herbName || ""))
      .filter(Boolean),

    whyherbs: (formData.whyherbs || []).map(trimVal).filter(Boolean),

    categories: (formData.categories || [])
      .map((c) => ({ categoryName: trimVal(c?.categoryName || "") }))
      .filter((c) => !!c.categoryName),

    variants: (formData.variants || [])
      .map((v) => ({ form: trimVal(v?.form || "") }))
      .filter((v) => !!v.form),

    faqs: (formData.faqs || []).map((f) => ({
      que: trimVal(f?.que || ""),
      ans: trimVal(f?.ans || ""),
    })).filter((f) => f.que && f.ans),

    reviews: (formData.reviews || []).map((r) => ({
      rating: Number(r?.rating ?? 0),
      name: trimVal(r?.name || ""),
      age: r?.age != null ? Number(r.age) : null,
      review: trimVal(r?.review || ""),
    })).filter((r) => r.name && r.review),

    ingredients: (formData.ingredients || []).map((i) => ({
      herbName: trimVal(i?.herbName || ""),
      latinName: trimVal(i?.latinName || ""),
      qtyGrams: i?.qtyGrams != null ? Number(i.qtyGrams) : null,
    })).filter((i) => i.herbName && i.qtyGrams != null),
  };

  const cleaned = {};
  Object.entries(base).forEach(([k, v]) => {
    if (!isEmpty(v)) cleaned[k] = v;
  });

  return cleaned;
}

/* =================================================================
                           MAIN COMPONENT
================================================================= */
export default function AddProduct() {
  const [formData, setFormData] = useState({
    slug: 'amrit-ayu-chyawanprash',
    status: 'ACTIVE',
    productImg: '',
    indication: 'Ayurvedic Immunity Booster',
    qtySize: 750,
    qtyUnit: 'GM',
    courseTime: 84,
    mrp: 1500.0,
    sellingPrice: 699.0,
    stock: 19,
    tags: ['BESTSELLER', 'TRENDING'],
    tagsEn: ['Chyawanprash', 'Immunity Booster'],
    labReport: '',
    title: 'Amrit Ayu Chyawanprash',
    subtitle: 'Nectar of holistic vitality and wellness',
    tagline: 'Strengthen your roots, shine with wellness.',
    longDesc: 'Premium Ayurvedic formulation for immunity and wellness',
    whyChoose: [],
    keyBenefits: [],
    howItWorks: [],
    safetyFirst: [],
    idealFor: [],
    usage: [],
    precautionsWarnings: [],
    trustBadges: [],
    trustBadgestag: [],
    keyherbs: [],
    whyherbs: [],
    categories: [{ categoryName: 'Immunity & General Wellness' }],
    variants: [{ form: 'AVALEH' }],
    faqs: [],
    reviews: [],
    ingredients: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    updateField('title', title);
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    updateField('slug', slug);
  };

  const handleImageBlur = (url) => {
    if (url && url.startsWith('http')) setImagePreview(url.trim());
  };

  const validateForm = () => {
    const next = {};
    if (!formData.title) next.title = 'Title is required';
    if (!formData.slug) next.slug = 'Slug is required';
    if (!formData.longDesc) next.longDesc = 'Description is required';
    if (!formData.qtySize || formData.qtySize <= 0) next.qtySize = 'Valid quantity required';
    if (!formData.mrp || formData.mrp <= 0) next.mrp = 'Valid MRP required';
    if (!formData.sellingPrice || formData.sellingPrice <= 0) next.sellingPrice = 'Valid price required';
    if (Number(formData.sellingPrice) > Number(formData.mrp)) next.sellingPrice = 'Price cannot exceed MRP';
    if (formData.stock === undefined || formData.stock < 0) next.stock = 'Valid stock required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ✅ UPDATED: Save to /api/products using `app`
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return showToast('Please fix form errors', 'error');

    try {
      setIsSubmitting(true);

      const payload = buildProductPayload(formData);
      const res = await app.post("/products", payload); // -> {{baseUrl}}/api/products
      // const created = res?.data?.data ?? res?.data;

      showToast('Product created successfully!', 'success');
      
      // (Optional) reset form after success:
      // handleReset();

    } catch (err) {
      const msg =
        err?.response?.data?.data?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create product';
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        setErrors(serverErrors);
      }
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      slug: 'amrit-ayu-chyawanprash',
      status: 'ACTIVE',
      productImg: '',
      indication: 'Ayurvedic Immunity Booster',
      qtySize: 750,
      qtyUnit: 'GM',
      courseTime: 84,
      mrp: 1500.0,
      sellingPrice: 699.0,
      stock: 19,
      tags: ['BESTSELLER', 'TRENDING'],
      tagsEn: ['Chyawanprash', 'Immunity Booster'],
      labReport: '',
      title: 'Amrit Ayu Chyawanprash',
      subtitle: 'Nectar of holistic vitality and wellness',
      tagline: 'Strengthen your roots, shine with wellness.',
      longDesc: 'Premium Ayurvedic formulation for immunity and wellness',
      whyChoose: [],
      keyBenefits: [],
      howItWorks: [],
      safetyFirst: [],
      idealFor: [],
      usage: [],
      precautionsWarnings: [],
      trustBadges: [],
      trustBadgestag: [],
      keyherbs: [],
      whyherbs: [],
      categories: [{ categoryName: 'Immunity & General Wellness' }],
      variants: [{ form: 'AVALEH' }],
      faqs: [],
      reviews: [],
      ingredients: [],
    });
    setImagePreview('');
    setErrors({});
    showToast('Form reset to defaults', 'info');
  };

  const trustBadgeOptions = [
    'Certified AYUSH-compliant',
    'No Preservatives',
    'Lab Tested',
    'Made in India 🇮🇳',
  ];

  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="max-w-7xl">
        <div className="mb-5">
          <h1 className="text-4xl font-bold text-black">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new product with detailed information</p>
        </div>

        {errorCount > 0 && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-black mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-black font-medium text-sm">
                There {errorCount === 1 ? 'is' : 'are'} {errorCount} error{errorCount > 1 ? 's' : ''} in the form
              </p>
              <p className="text-black text-xs mt-0.5">Please review and fix them before submitting.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* ---------------  MAIN FORM  --------------- */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential product details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input id="title" value={formData.title} onChange={handleTitleChange} placeholder="Product title" />
                      {errors.title && <p className="text-sm text-black mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => updateField('subtitle', e.target.value)}
                        placeholder="Product subtitle"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={formData.tagline}
                        onChange={(e) => updateField('tagline', e.target.value)}
                        placeholder="Catchy tagline"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => updateField('slug', e.target.value)}
                        placeholder="product-slug"
                        className="font-mono"
                      />
                      {errors.slug && <p className="text-sm text-black mt-1">{errors.slug}</p>}
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="productImg">Product Image URL</Label>
                      <Input
                        id="productImg"
                        value={formData.productImg}
                        onChange={(e) => updateField('productImg', e.target.value)}
                        onBlur={(e) => handleImageBlur(e.target.value)}
                        placeholder="https://..."
                      />
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded border" />
                      )}
                    </div>

                    <div>
                      <Label htmlFor="labReport">Lab Report URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="labReport"
                          value={formData.labReport}
                          onChange={(e) => updateField('labReport', e.target.value)}
                          placeholder="https://..."
                        />
                        {formData.labReport && (
                          <Button type="button" variant="outline" size="icon" asChild>
                            <a href={formData.labReport} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="indication">Indication</Label>
                      <Input
                        id="indication"
                        value={formData.indication}
                        onChange={(e) => updateField('indication', e.target.value)}
                        placeholder="Product indication"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pack & Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pack & Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="qtySize">Quantity Size *</Label>
                      <Input
                        id="qtySize"
                        type="number"
                        value={formData.qtySize}
                        onChange={(e) => updateField('qtySize', parseFloat(e.target.value))}
                        placeholder="750"
                      />
                      {errors.qtySize && <p className="text-sm text-black mt-1">{errors.qtySize}</p>}
                    </div>

                    <div>
                      <Label htmlFor="qtyUnit">Unit *</Label>
                      <Select value={formData.qtyUnit} onValueChange={(value) => updateField('qtyUnit', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GM">Grams (GM)</SelectItem>
                          <SelectItem value="ML">Milliliters (ML)</SelectItem>
                          <SelectItem value="PCS">Pieces (PCS)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="courseTime">Course Time (days)</Label>
                      <Input
                        id="courseTime"
                        type="number"
                        value={formData.courseTime}
                        onChange={(e) => updateField('courseTime', parseFloat(e.target.value))}
                        placeholder="84"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mrp">MRP *</Label>
                      <Input
                        id="mrp"
                        type="number"
                        step="0.01"
                        value={formData.mrp}
                        onChange={(e) => updateField('mrp', parseFloat(e.target.value))}
                        placeholder="1500.00"
                      />
                      {errors.mrp && <p className="text-sm text-black mt-1">{errors.mrp}</p>}
                    </div>

                    <div>
                      <Label htmlFor="sellingPrice">Selling Price *</Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        step="0.01"
                        value={formData.sellingPrice}
                        onChange={(e) => updateField('sellingPrice', parseFloat(e.target.value))}
                        placeholder="699.00"
                      />
                      {errors.sellingPrice && <p className="text-sm text-black mt-1">{errors.sellingPrice}</p>}
                    </div>

                    <div>
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => updateField('stock', parseInt(e.target.value))}
                        placeholder="19"
                      />
                      {errors.stock && <p className="text-sm text-black mt-1">{errors.stock}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Product Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['BESTSELLER', 'TRENDING', 'NEW', 'LIMITED'].map((tag) => (
                        <Badge
                          key={tag}
                          variant={formData.tags?.includes(tag) ? 'default' : 'outline'}
                          onClick={() => {
                            const current = formData.tags || [];
                            if (current.includes(tag)) {
                              updateField('tags', current.filter((t) => t !== tag));
                            } else {
                              updateField('tags', [...current, tag]);
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <ChipInput
                    label="English Tags"
                    chips={formData.tagsEn || []}
                    onChange={(chips) => updateField('tagsEn', chips)}
                    placeholder="Add tag..."
                  />
                </CardContent>
              </Card>

              {/* Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="longDesc">Long Description *</Label>
                    <Textarea
                      id="longDesc"
                      value={formData.longDesc}
                      onChange={(e) => updateField('longDesc', e.target.value)}
                      rows={4}
                      placeholder="Detailed product description"
                    />
                    {errors.longDesc && <p className="text-sm text-black mt-1">{errors.longDesc}</p>}
                  </div>

                  <RepeatableField
                    label="Why Choose"
                    fields={formData.whyChoose || []}
                    onChange={(fields) => updateField('whyChoose', fields)}
                    placeholder="Reason to choose this product"
                  />

                  <RepeatableField
                    label="Key Benefits"
                    fields={formData.keyBenefits || []}
                    onChange={(fields) => updateField('keyBenefits', fields)}
                    placeholder="Benefit description"
                  />

                  <RepeatableField
                    label="How It Works"
                    fields={formData.howItWorks || []}
                    onChange={(fields) => updateField('howItWorks', fields)}
                    placeholder="Mechanism description"
                  />

                  <RepeatableField
                    label="Safety First"
                    fields={formData.safetyFirst || []}
                    onChange={(fields) => updateField('safetyFirst', fields)}
                    placeholder="Safety information"
                  />

                  <RepeatableField
                    label="Ideal For"
                    fields={formData.idealFor || []}
                    onChange={(fields) => updateField('idealFor', fields)}
                    placeholder="Target audience"
                  />

                  <RepeatableField
                    label="Usage Instructions"
                    fields={formData.usage || []}
                    onChange={(fields) => updateField('usage', fields)}
                    placeholder="Usage instruction"
                  />

                  <RepeatableField
                    label="Precautions & Warnings"
                    fields={formData.precautionsWarnings || []}
                    onChange={(fields) => updateField('precautionsWarnings', fields)}
                    placeholder="Precaution or warning"
                  />

                  <div>
                    <Label>Trust Badges</Label>
                    <div className="space-y-2 mt-2">
                      {trustBadgeOptions.map((badge) => (
                        <div key={badge} className="flex items-center space-x-2">
                          <Checkbox
                            id={badge}
                            checked={formData.trustBadges?.includes(badge)}
                            onCheckedChange={(checked) => {
                              const current = formData.trustBadges || [];
                              if (checked) updateField('trustBadges', [...current, badge]);
                              else updateField('trustBadges', current.filter((b) => b !== badge));
                            }}
                          />
                          <Label htmlFor={badge} className="font-normal cursor-pointer">
                            {badge}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <RepeatableField
                    label="Trust Badge Tagline"
                    fields={formData.trustBadgestag || []}
                    onChange={(fields) => updateField('trustBadgestag', fields)}
                    placeholder="Trust tagline"
                  />
                </CardContent>
              </Card>

              {/* Herbs */}
              <Card>
                <CardHeader>
                  <CardTitle>Herbs & Rationale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <HerbField herbs={formData.keyherbs || []} onChange={(herbs) => updateField('keyherbs', herbs)} />

                  <RepeatableField
                    label="Why These Herbs"
                    fields={formData.whyherbs || []}
                    onChange={(fields) => updateField('whyherbs', fields)}
                    placeholder="Herb rationale"
                  />
                </CardContent>
              </Card>

              {/* Categories & Variants */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories & Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Categories</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateField('categories', [...formData.categories, { categoryName: '' }])
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {formData.categories.map((cat, index) => {
                        const predefined = [
                          'Energy & Stamina',
                          'Pain Relief',
                          'Hair & Skin Care',
                          'Digestive Health',
                          "Men's Health",
                          "Women's Health",
                          'Weight Management',
                          'Specialized Health',
                          'Nutritional Supplements',
                          'Immunity & General Wellness',
                        ];

                        return (
                          <div key={index} className="flex gap-2">
                            <Select
                              value={cat.categoryName}
                              onValueChange={(val) => {
                                const updated = [...formData.categories];
                                updated[index].categoryName = val;
                                updateField('categories', updated);
                              }}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Pick or type new category" />
                              </SelectTrigger>
                              <SelectContent>
                                {predefined.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() =>
                                updateField(
                                  'categories',
                                  formData.categories.filter((_, i) => i !== index)
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Variants</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateField('variants', [...formData.variants, { form: 'AVALEH' }])}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="flex gap-2">
                          <Select
                            value={variant.form}
                            onValueChange={(value) => {
                              const updated = [...formData.variants];
                              updated[index].form = value;
                              updateField('variants', updated);
                            }}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['AVALEH', 'OIL', 'SEEDS', 'POWDER', 'RESIN', 'SYRUP', 'LIQUID', 'SHAMPOO', 'TABLETS', 'CREAM'].map(
                                (form) => (
                                  <SelectItem key={form} value={form}>
                                    {form}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              updateField(
                                'variants',
                                formData.variants.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQs */}
              <Card>
                <CardHeader>
                  <CardTitle>FAQs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Frequently Asked Questions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateField('faqs', [...formData.faqs, { que: '', ans: '' }])}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add FAQ
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.faqs.map((faq, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex justify-between items-start">
                            <Label>Question {index + 1}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                updateField(
                                  'faqs',
                                  formData.faqs.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={faq.que}
                            onChange={(e) => {
                              const updated = [...formData.faqs];
                              updated[index].que = e.target.value;
                              updateField('faqs', updated);
                            }}
                            placeholder="Question"
                          />
                          <Textarea
                            value={faq.ans}
                            onChange={(e) => {
                              const updated = [...formData.faqs];
                              updated[index].ans = e.target.value;
                              updateField('faqs', updated);
                            }}
                            placeholder="Answer"
                            rows={3}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Reviews</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateField('reviews', [...formData.reviews, { rating: 5, name: '', age: 0, review: '' }])}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Review
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.reviews.map((review, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex justify-between items-start">
                            <Label>Review {index + 1}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                updateField(
                                  'reviews',
                                  formData.reviews.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label>Rating (1-5)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="5"
                                value={review.rating}
                                onChange={(e) => {
                                  const updated = [...formData.reviews];
                                  updated[index].rating = parseInt(e.target.value || 0, 10);
                                  updateField('reviews', updated);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={review.name}
                                onChange={(e) => {
                                  const updated = [...formData.reviews];
                                  updated[index].name = e.target.value;
                                  updateField('reviews', updated);
                                }}
                              />
                            </div>
                            <div>
                              <Label>Age</Label>
                              <Input
                                type="number"
                                value={review.age}
                                onChange={(e) => {
                                  const updated = [...formData.reviews];
                                  updated[index].age = parseInt(e.target.value || 0, 10);
                                  updateField('reviews', updated);
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Review</Label>
                            <Textarea
                              value={review.review}
                              onChange={(e) => {
                                const updated = [...formData.reviews];
                                updated[index].review = e.target.value;
                                updateField('reviews', updated);
                              }}
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Ingredient List</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateField('ingredients', [...formData.ingredients, { herbName: '', latinName: '', qtyGrams: 0 }])}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Ingredient
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">Herb Name</Label>
                          <Input
                            value={ingredient.herbName}
                            onChange={(e) => {
                              const updated = [...formData.ingredients];
                              updated[index].herbName = e.target.value;
                              updateField('ingredients', updated);
                            }}
                            placeholder="Amla"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs">Latin Name</Label>
                          <Input
                            value={ingredient.latinName}
                            onChange={(e) => {
                              const updated = [...formData.ingredients];
                              updated[index].latinName = e.target.value;
                              updateField('ingredients', updated);
                            }}
                            placeholder="Phyllanthus emblica"
                          />
                        </div>
                        <div className="w-32">
                          <Label className="text-xs">Qty (grams)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={ingredient.qtyGrams}
                            onChange={(e) => {
                              const updated = [...formData.ingredients];
                              updated[index].qtyGrams = parseFloat(e.target.value || '0');
                              updateField('ingredients', updated);
                            }}
                            placeholder="4.0"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            updateField(
                              'ingredients',
                              formData.ingredients.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ---------------  STICKY SUMMARY  --------------- */}
            <div className="lg:col-span-1">
              <ProductSummary
                title={formData.title}
                slug={formData.slug}
                mrp={formData.mrp}
                sellingPrice={formData.sellingPrice}
                stock={formData.stock}
                status={formData.status}
                isSubmitting={isSubmitting}
                onReset={handleReset}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
