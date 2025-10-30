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

/* ----------  PRESET CATEGORIES (can be replaced with API data later) ---------- */
const CATEGORY_OPTIONS = [
  { name: "Energy & Stamina" },
  { name: "Pain Relief" },
  { name: "Hair & Skin Care" },
  { name: "Digestive Health" },
  { name: "Men's Health" },
  { name: "Women's Health" },
  { name: "Weight Management" },
  { name: "Specialized Health" },
  { name: "Nutritional Supplements" },
  { name: "Immunity & General Wellness" },
];

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
          return React.cloneElement(child, { onSelect: handleSelect });
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
    if (input.trim() && !(chips || []).includes(input.trim())) {
      onChange([...(chips || []), input.trim()]);
      setInput('');
    }
  };
  const removeChip = (index) => onChange((chips || []).filter((_, i) => i !== index));
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {(chips || []).map((chip, index) => (
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

/* ----------  REPEATABLE BI-LINGUAL FIELD (UI only; *Hi not submitted) ---------- */
const RepeatableBiField = ({
  label,
  items = [],
  onChange,
  placeholderEn = 'English',
  placeholderHi = 'हिंदी',
}) => {
  const add = () => onChange([...(items || []), { en: '', hi: '' }]);
  const remove = (idx) => onChange((items || []).filter((_, i) => i !== idx));
  const set = (idx, key, val) => {
    const next = [...(items || [])];
    next[idx] = { ...(next[idx] || {}), [key]: val };
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {(items || []).map((item, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              value={item?.en || ''}
              onChange={(e) => set(i, 'en', e.target.value)}
              placeholder={placeholderEn}
            />
            <Input
              value={item?.hi || ''}
              onChange={(e) => set(i, 'hi', e.target.value)}
              placeholder={placeholderHi}
            />
            <Button type="button" variant="destructive" size="icon" onClick={() => remove(i)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ----------  HERB FIELD (structured EN/HI) ---------- */
const HerbField = ({ herbs, onChange }) => {
  const addHerb = () =>
    onChange([
      ...(herbs || []),
      { herbTitleEn: '', herbTitleHi: '', herbDescEn: '', herbDescHi: '' },
    ]);
  const removeHerb = (index) => onChange((herbs || []).filter((_, i) => i !== index));
  const updateHerb = (index, field, value) => {
    const updated = [...(herbs || [])];
    updated[index] = { ...(updated[index] || {}), [field]: value };
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
        {(herbs || []).map((herb, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-3">
                <div className="text-right">
                  <button type="button" onClick={() => removeHerb(index)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Herb Title (EN)</Label>
                    <Input
                      value={herb.herbTitleEn || ''}
                      onChange={(e) => updateHerb(index, 'herbTitleEn', e.target.value)}
                      placeholder="Ashwagandha"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Herb Title (HI)</Label>
                    <Input
                      value={herb.herbTitleHi || ''}
                      onChange={(e) => updateHerb(index, 'herbTitleHi', e.target.value)}
                      placeholder="अश्वगंधा"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Description (EN)</Label>
                    <Input
                      value={herb.herbDescEn || ''}
                      onChange={(e) => updateHerb(index, 'herbDescEn', e.target.value)}
                      placeholder="Add description..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description (HI)</Label>
                    <Input
                      value={herb.herbDescHi || ''}
                      onChange={(e) => updateHerb(index, 'herbDescHi', e.target.value)}
                      placeholder="विवरण जोड़ें..."
                    />
                  </div>
                </div>
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
  (typeof v === 'string' && v.trim() === '') ||
  (Array.isArray(v) && v.length === 0);

const trimVal = (v) => (typeof v === 'string' ? v.trim() : v);

/** Matches ProductDto/Product exactly for new backend (no legacy keyherbs fields). */
function buildProductPayload(formData) {
  // ---- Relations (make it robust for different server DTOs) ----
  const categoriesArr = (formData.categories || [])
    .map(c => ({
      categoryId: c.categoryId ?? null,
      categoryName: trimVal(c?.categoryName || ''),
    }))
    .filter(c => !!c.categoryName || Number.isFinite(c.categoryId));

  const variantsArr = (formData.variants || [])
    .map(v => ({ variantId: v.variantId || null, form: trimVal(v?.form || '') }))
    .filter(v => !!v.form);

  const base = {
    slug: trimVal(formData.slug),
    status: formData.status,
    productImg: trimVal(formData.productImg || ''),
    bannerImg: trimVal(formData.bannerImg || ''), // <-- added
    indication: trimVal(formData.indication || ''),
    indicationHi: trimVal(formData.indicationHi || ''),

    qtySize: Number(formData.qtySize ?? 0),
    qtyUnit: formData.qtyUnit,
    courseTime: formData.courseTime ? Number(formData.courseTime) : null,
    mrp: formData.mrp != null ? Number(formData.mrp) : null,
    sellingPrice: formData.sellingPrice != null ? Number(formData.sellingPrice) : null,
    stock: formData.stock != null ? Number(formData.stock) : 0,

    // badges + tags
    tags: Array.isArray(formData.tags) ? formData.tags : [],
    tagsEn: (formData.tagsEn || []).map(trimVal).filter(Boolean),
    tagsHi: (formData.tagsHi || []).map(trimVal).filter(Boolean),

    labReport: trimVal(formData.labReport || ''),

    // EN text
    title: trimVal(formData.title || ''),
    subtitle: trimVal(formData.subtitle || ''),
    tagline: trimVal(formData.tagline || ''),
    longDesc: trimVal(formData.longDesc || ''),

    // HI text
    titleHi: trimVal(formData.titleHi || ''),
    subtitleHi: trimVal(formData.subtitleHi || ''),
    taglineHi: trimVal(formData.taglineHi || ''),
    longDescHi: trimVal(formData.longDescHi || ''),

    // EN lists
    whyChoose: (formData.whyChoose || []).map(trimVal).filter(Boolean),
    keyBenefits: (formData.keyBenefits || []).map(trimVal).filter(Boolean),
    howItWorks: (formData.howItWorks || []).map(trimVal).filter(Boolean),
    safetyFirst: (formData.safetyFirst || []).map(trimVal).filter(Boolean),
    idealFor: (formData.idealFor || []).map(trimVal).filter(Boolean),
    usage: (formData.usage || []).map(trimVal).filter(Boolean),
    precautionsWarnings: (formData.precautionsWarnings || []).map(trimVal).filter(Boolean),
    trustBadges: (formData.trustBadges || []).map(trimVal).filter(Boolean),
    trustBadgestag: (formData.trustBadgestag || []).map(trimVal).filter(Boolean),

    // HI lists
    whyChooseHi: (formData.whyChooseHi || []).map(trimVal).filter(Boolean),
    keyBenefitsHi: (formData.keyBenefitsHi || []).map(trimVal).filter(Boolean),
    howItWorksHi: (formData.howItWorksHi || []).map(trimVal).filter(Boolean),
    safetyFirstHi: (formData.safetyFirstHi || []).map(trimVal).filter(Boolean),
    idealForHi: (formData.idealForHi || []).map(trimVal).filter(Boolean),
    usageHi: (formData.usageHi || []).map(trimVal).filter(Boolean),
    precautionsWarningsHi: (formData.precautionsWarningsHi || []).map(trimVal).filter(Boolean),
    trustBadgestagHi: (formData.trustBadgestagHi || []).map(trimVal).filter(Boolean),

    // ---------- Herbs/rationale ----------
    keyHerbDetails: (formData.keyherbs || [])
      .map(h => ({
        herbTitleEn: trimVal(h?.herbTitleEn || ''),
        herbDescEn: trimVal(h?.herbDescEn || ''),
        herbTitleHi: trimVal(h?.herbTitleHi || ''),
        herbDescHi: trimVal(h?.herbDescHi || ''),
      }))
      .filter(h => Object.values(h).some(v => !!(v && String(v).trim()))),

    whyherbs: (formData.whyherbs || []).map(trimVal).filter(Boolean),
    whyherbsHi: (formData.whyherbsHi || []).map(trimVal).filter(Boolean),

    // ---- Relations (keep nested objects) ----
    categories: categoriesArr,

    // Also provide simple lists for servers that bind by names/ids
    categoryIds: categoriesArr
      .map(c => c.categoryId)
      .filter(id => Number.isFinite(id)),

    categoryNames: categoriesArr
      .map(c => c.categoryName)
      .filter(Boolean),

    variants: variantsArr,

    // Reviews
    reviews: (formData.reviews || [])
      .map(r => ({
        rating: r?.rating != null ? Number(r.rating) : null,
        name: trimVal(r?.name || ''),
        age: r?.age != null && r?.age !== '' ? Number(r.age) : null,
        review: trimVal(r?.review || ''),
        photo: trimVal(r?.photo || ''),
      }))
      .filter(r => r.rating >= 1 && r.rating <= 5 && r.name && r.review),

    // FAQs
    faqs: (formData.faqs || [])
      .map(f => ({
        faqId: f.faqId || null,
        que: trimVal(f?.que || ''),
        ans: trimVal(f?.ans || ''),
        queHi: trimVal(f?.queHi || ''),
        ansHi: trimVal(f?.ansHi || ''),
      }))
      .filter(f => f.que && f.ans),

    // Ingredients
    ingredients: (formData.ingredients || [])
      .map(i => ({
        ingredientId: i.ingredientId || null,
        herbName: trimVal(i?.herbName || ''),
        herbNameHi: trimVal(i?.herbNameHi || ''),
        latinName: trimVal(i?.latinName || ''),
        qtyGrams: i?.qtyGrams != null ? Number(i.qtyGrams) : null,
      }))
      .filter(i => i.herbName && i.qtyGrams != null),
  };

  const cleaned = {};
  Object.entries(base).forEach(([k, v]) => { if (!isEmpty(v)) cleaned[k] = v; });
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
    bannerImg: '', // <-- added
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

    // Structured key herbs (edited in UI under key 'keyherbs')
    keyherbs: [
      { herbTitleEn: '', herbTitleHi: '', herbDescEn: '', herbDescHi: '' }
    ],
    whyherbs: [],

    categories: [{ categoryName: 'Immunity & General Wellness' }],
    variants: [{ form: 'AVALEH' }],

    // Start with ONE empty review row
    reviews: [{ rating: 5, name: '', age: null, review: '', photo: '' }],

    faqs: [],
    ingredients: [],

    // UI-only Hindi mirrors
    titleHi: '',
    subtitleHi: '',
    taglineHi: '',
    longDescHi: '',
    indicationHi: '',
    tagsHi: [],
    whyChooseHi: [],
    keyBenefitsHi: [],
    howItWorksHi: [],
    safetyFirstHi: [],
    idealForHi: [],
    usageHi: [],
    precautionsWarningsHi: [],
    trustBadgestagHi: [],
    whyherbsHi: [],

    // helper for UI picker
    __selectedCategory: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [bannerimagePreview, setBannerImagePreview] = useState('');
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
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

  const handleBannerImageBlur = (url) => {
    if (url && url.startsWith('http')) setBannerImagePreview(url.trim());
  };

  const hasAtLeastOneValidReview = () => {
    const list = formData.reviews || [];
    return list.some((r) => {
      const ratingOk = Number(r.rating) >= 1 && Number(r.rating) <= 5;
      return ratingOk && (r.name?.trim()?.length > 0) && (r.review?.trim()?.length > 0);
    });
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

    if (!hasAtLeastOneValidReview()) {
      next.reviews = 'Please add at least one review with rating (1–5), name, and text.';
    }

    const kbCount = (formData.keyBenefits || []).filter(
      (b) => (b || '').trim().length > 0
    ).length;
    if (kbCount < 4) {
      next.keyBenefits = 'Please add at least 4 key benefits.';
      showToast('Please add at least 4 key benefits before submitting.', 'error');
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Save
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return showToast('Please fix form errors', 'error');

    try {
      setIsSubmitting(true);
      const payload = buildProductPayload(formData);
      await app.post('/products', payload);
      showToast('Product created successfully!', 'success');
    } catch (err) {
      const msg =
        err?.response?.data?.data?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create product';
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') setErrors(serverErrors);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData((prev) => ({
      ...prev,
      slug: 'amrit-ayu-chyawanprash',
      status: 'ACTIVE',
      productImg: '',
      bannerImg: '', // <-- reset too
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

      // structured herbs
      keyherbs: [
        { herbTitleEn: '', herbTitleHi: '', herbDescEn: '', herbDescHi: '' }
      ],
      whyherbs: [],
      categories: [{ categoryName: 'Immunity & General Wellness' }],
      variants: [{ form: 'AVALEH' }],

      // Keep one empty review on reset
      reviews: [{ rating: 5, name: '', age: null, review: '', photo: '' }],

      faqs: [],
      ingredients: [],

      // UI-only Hindi mirrors reset
      titleHi: '',
      subtitleHi: '',
      taglineHi: '',
      longDescHi: '',
      indicationHi: '',
      tagsHi: [],
      whyChooseHi: [],
      keyBenefitsHi: [],
      howItWorksHi: [],
      safetyFirstHi: [],
      idealForHi: [],
      usageHi: [],
      precautionsWarningsHi: [],
      trustBadgestagHi: [],
      whyherbsHi: [],

      __selectedCategory: '',
    }));
    setImagePreview('');
    setBannerImagePreview('');
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

  /* helpers for Reviews UI */
  const addEmptyReview = () =>
    updateField('reviews', [
      ...(formData.reviews || []),
      { rating: 5, name: '', age: null, review: '', photo: '' },
    ]);
  const removeReviewAt = (idx) => {
    const list = formData.reviews || [];
    if (list.length <= 1) {
      showToast('At least one review is required', 'error');
      return;
    }
    updateField('reviews', list.filter((_, i) => i !== idx));
  };

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
              {errors.reviews && <p className="text-black text-xs mt-1">{errors.reviews}</p>}
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

                    {/* UI-only Hindi Title (not submitted) */}
                    <div className="col-span-2">
                      <Label htmlFor="titleHi">Title (Hindi)</Label>
                      <Input
                        id="titleHi"
                        value={formData.titleHi}
                        onChange={(e) => updateField('titleHi', e.target.value)}
                        placeholder="शीर्षक (हिंदी)"
                      />
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
                      <Label htmlFor="subtitleHi">Subtitle (Hindi)</Label>
                      <Input
                        id="subtitleHi"
                        value={formData.subtitleHi}
                        onChange={(e) => updateField('subtitleHi', e.target.value)}
                        placeholder="उपशीर्षक (हिंदी)"
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
                      <Label htmlFor="taglineHi">Tagline (Hindi)</Label>
                      <Input
                        id="taglineHi"
                        value={formData.taglineHi}
                        onChange={(e) => updateField('taglineHi', e.target.value)}
                        placeholder="टैगलाइन (हिंदी)"
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

                    {/* Banner Image */}
                    <div>
                      <Label htmlFor="bannerImg">Banner Image URL</Label>
                      <Input
                        id="bannerImg"
                        value={formData.bannerImg}
                        onChange={(e) => updateField('bannerImg', e.target.value)}
                        placeholder="https://..."
                        onBlur={(e) => handleBannerImageBlur(e.target.value)}
                      />
                      {formData.bannerImg && (
                        <img src={formData.bannerImg} className="mt-2 h-20 w-20 object-cover rounded border" />
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
                    {/* UI-only Hindi (not submitted) */}
                    <div className="col-span-2">
                      <Label htmlFor="indicationHi">Indication (Hindi)</Label>
                      <Input
                        id="indicationHi"
                        value={formData.indicationHi}
                        onChange={(e) => updateField('indicationHi', e.target.value)}
                        placeholder="संकेत (हिंदी)"
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
                      {['BESTSELLER', 'TRENDING', 'NEW', 'LIMITED', 'HOT_ITEM'].map((tag) => (
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

                  {/* UI-only Hindi tags (also submitted if you want) */}
                  <ChipInput
                    label="Hindi Tags"
                    chips={formData.tagsHi || []}
                    onChange={(chips) => updateField('tagsHi', chips)}
                    placeholder="टैग जोड़ें ..."
                  />
                </CardContent>
              </Card>

              {/* Content (EN + UI-only HI) */}
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

                  {/* UI-only Hindi long description */}
                  <div>
                    <Label htmlFor="longDescHi">Long Description (Hindi)</Label>
                    <Textarea
                      id="longDescHi"
                      value={formData.longDescHi}
                      onChange={(e) => updateField('longDescHi', e.target.value)}
                      rows={4}
                      placeholder="विस्तृत विवरण (हिंदी)"
                    />
                  </div>

                  <RepeatableBiField
                    label="Why Choose"
                    items={(formData.whyChoose || []).map((en, i) => ({ en, hi: formData.whyChooseHi?.[i] || '' }))}
                    onChange={(rows) => {
                      updateField('whyChoose', rows.map((r) => r.en));
                      updateField('whyChooseHi', rows.map((r) => r.hi));
                    }}
                    placeholderEn="Reason (EN)"
                    placeholderHi="कारण (HI)"
                  />

                  <RepeatableBiField
                    label="Key Benefits"
                    items={(formData.keyBenefits || []).map((en, i) => ({ en, hi: formData.keyBenefitsHi?.[i] || '' }))}
                    onChange={(rows) => {
                      updateField('keyBenefits', rows.map((r) => r.en));
                      updateField('keyBenefitsHi', rows.map((r) => r.hi));
                    }}
                    placeholderEn="Benefit (EN) "
                    placeholderHi="लाभ (HI)"
                  />
                  {errors.keyBenefits && <p className="text-sm text-rose-600 mt-1">{errors.keyBenefits}</p>}

                  <RepeatableBiField
                    label="How It Works"
                    items={(formData.howItWorks || []).map((en, i) => ({ en, hi: formData.howItWorksHi?.[i] || '' }))}
                    onChange={(rows) => {
                      updateField('howItWorks', rows.map((r) => r.en));
                      updateField('howItWorksHi', rows.map((r) => r.hi));
                    }}
                    placeholderEn="Mechanism (EN)"
                    placeholderHi="कार्यविधि (HI)"
                  />

                  <RepeatableBiField
                    label="Safety First"
                    items={(formData.safetyFirst || []).map((en, i) => ({ en, hi: formData.safetyFirstHi?.[i] || '' }))}
                    onChange={(rows) => {
                      updateField('safetyFirst', rows.map((r) => r.en));
                      updateField('safetyFirstHi', rows.map((r) => r.hi));
                    }}
                    placeholderEn="Safety info (EN)"
                    placeholderHi="सावधानी (HI)"
                  />

                  <RepeatableBiField
                    label="Ideal For"
                    items={(formData.idealFor || []).map((en, i) => ({ en, hi: formData.idealForHi?.[i] || '' }))}
                    onChange={(rows) => {
                      updateField('idealFor', rows.map((r) => r.en));
                      updateField('idealForHi', rows.map((r) => r.hi));
                    }}
                    placeholderEn="Audience (EN)"
                    placeholderHi="लक्षित उपयोगकर्ता (HI)"
                  />

                  <RepeatableBiField
                    label="Usage Instructions"
                    items={(formData.usage || []).map((en, i) => ({ en, hi: formData.usageHi?.[i] || '' }))}
                    onChange={(rows) => {
                      updateField('usage', rows.map((r) => r.en));
                      updateField('usageHi', rows.map((r) => r.hi));
                    }}
                    placeholderEn="Usage (EN)"
                    placeholderHi="उपयोग (HI)"
                  />

                  <RepeatableBiField
                    label="Precautions & Warnings"
                    items={(formData.precautionsWarnings || []).map((en, i) => ({ en, hi: formData.precautionsWarningsHi?.[i] || '' }))}
                    onChange={(rows) => {
                      updateField('precautionsWarnings', rows.map((r) => r.en));
                      updateField('precautionsWarningsHi', rows.map((r) => r.hi));
                    }}
                    placeholderEn="Precaution (EN)"
                    placeholderHi="चेतावनी (HI)"
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

                  {/* Optional custom badges to allow free-form entries */}
                  <ChipInput
                    label="Custom / Extra Trust Badges"
                    chips={formData.trustBadges || []}
                    onChange={(chips) => updateField('trustBadges', chips)}
                    placeholder="Add custom badge…"
                  />

                  <RepeatableBiField
                    label="Trust Badge Tagline"
                    items={(formData.trustBadgestag || []).map((en, i) => ({ en, hi: formData.trustBadgestagHi?.[i] || '' }))}
                    onChange={(rows) => {
                      updateField('trustBadgestag', rows.map((r) => r.en));
                      updateField('trustBadgestagHi', rows.map((r) => r.hi));
                    }}
                    placeholderEn="Tagline (EN)"
                    placeholderHi="पंक्ति (HI)"
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

                  <RepeatableBiField
                    label="Why These Herbs"
                    items={(formData.whyherbs || []).map((en, i) => ({ en, hi: formData.whyherbsHi?.[i] || '' }))}
                    onChange={(rows) => {
                      updateField('whyherbs', rows.map((r) => r.en));
                      updateField('whyherbsHi', rows.map((r) => r.hi));
                    }}
                    placeholderEn="Rationale (EN)"
                    placeholderHi="तर्क (HI)"
                  />
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Select from the preset list (you can add multiple)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Picker row */}
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <Select
                      value={formData.__selectedCategory || ""}
                      onValueChange={(val) => updateField("__selectedCategory", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            <div className="flex items-center gap-2">
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const selected = CATEGORY_OPTIONS.find(c => c.name === formData.__selectedCategory);
                        if (!selected) return;
                        const name = selected.name;
                        const exists = (formData.categories || []).some(
                          (c) => (c?.categoryName || "").toLowerCase() === name.toLowerCase()
                        );
                        if (exists) return;
                        updateField("categories", [
                          ...(formData.categories || []),
                          // If later you add IDs in CATEGORY_OPTIONS, keep them here:
                          { categoryId: selected.id ?? null, categoryName: name }
                        ]);
                        updateField("__selectedCategory", "");
                      }}
                      disabled={
                        !formData.__selectedCategory ||
                        (formData.categories || []).some(
                          (c) => (c?.categoryName || "").toLowerCase() === (formData.__selectedCategory || "").toLowerCase()
                        )
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Selected list */}
                  {(formData.categories || []).length === 0 ? (
                    <p className="text-xs text-gray-500">No categories selected yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(formData.categories || []).map((c, i) => (
                        <Badge key={`${c.categoryName}-${i}`} variant="default" className="gap-2">
                          {c.categoryName}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() =>
                              updateField(
                                "categories",
                                (formData.categories || []).filter((_, idx) => idx !== i)
                              )
                            }
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Variants */}
              <Card>
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                  <CardDescription>Add available dosage forms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(formData.variants || []).map((v, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto] gap-2 items-end">
                      <Input
                        value={v.form || ''}
                        onChange={(e) => {
                          const next = [...(formData.variants || [])];
                          next[i] = { ...next[i], form: e.target.value };
                          updateField('variants', next);
                        }}
                        placeholder="e.g., AVALEH"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          updateField('variants', (formData.variants || []).filter((_, idx) => idx !== i))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateField('variants', [...(formData.variants || []), { form: '' }])}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Variant
                  </Button>
                </CardContent>
              </Card>

              {/* FAQs */}
              <Card>
                <CardHeader>
                  <CardTitle>FAQs</CardTitle>
                  <CardDescription>Add common questions and answers (EN + optional HI)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label>FAQ List</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateField('faqs', [
                          ...(formData.faqs || []),
                          { que: '', ans: '', queHi: '', ansHi: '' },
                        ])
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add FAQ
                    </Button>
                  </div>

                  {(formData.faqs || []).length === 0 && (
                    <p className="text-xs text-gray-500">No FAQs added yet.</p>
                  )}

                  <div className="space-y-3">
                    {(formData.faqs || []).map((faq, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex justify-between items-start">
                            <Label>FAQ {index + 1}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                updateField(
                                  'faqs',
                                  (formData.faqs || []).filter((_, i) => i !== index)
                                );
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* EN row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Question (EN)</Label>
                              <Input
                                value={faq.que}
                                onChange={(e) => {
                                  const next = [...(formData.faqs || [])];
                                  next[index].que = e.target.value;
                                  updateField('faqs', next);
                                }}
                                placeholder="When should I take it?"
                              />
                            </div>
                            <div>
                              <Label>Answer (EN)</Label>
                              <Input
                                value={faq.ans}
                                onChange={(e) => {
                                  const next = [...(formData.faqs || [])];
                                  next[index].ans = e.target.value;
                                  updateField('faqs', next);
                                }}
                                placeholder="Take 1 tsp after breakfast."
                              />
                            </div>
                          </div>

                          {/* HI row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Question (HI)</Label>
                              <Input
                                value={faq.queHi || ''}
                                onChange={(e) => {
                                  const next = [...(formData.faqs || [])];
                                  next[index].queHi = e.target.value;
                                  updateField('faqs', next);
                                }}
                                placeholder="इसे कब लें?"
                              />
                            </div>
                            <div>
                              <Label>Answer (HI)</Label>
                              <Input
                                value={faq.ansHi || ''}
                                onChange={(e) => {
                                  const next = [...(formData.faqs || [])];
                                  next[index].ansHi = e.target.value;
                                  updateField('faqs', next);
                                }}
                                placeholder="नाश्ते के बाद 1 चम्मच।"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews — add/remove but keep at least one */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Reviews</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEmptyReview}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Review
                    </Button>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-4">
                    At least one review with rating, name, and text is required.
                  </p>
                  <div className="space-y-4">
                    {formData.reviews.map((review, index) => {
                      const canRemove = (formData.reviews?.length || 0) > 1;
                      return (
                        <Card key={index}>
                          <CardContent className="pt-6 space-y-3">
                            <div className="flex justify-between items-start">
                              <Label>Review {index + 1}</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={!canRemove}
                                onClick={() => removeReviewAt(index)}
                                title={canRemove ? 'Remove review' : 'At least one review is required'}
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
                                  value={review.age ?? ''}
                                  onChange={(e) => {
                                    const updated = [...formData.reviews];
                                    updated[index].age = e.target.value === '' ? null : parseInt(e.target.value || 0, 10);
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
                      );
                    })}
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
                      onClick={() =>
                        updateField('ingredients', [...(formData.ingredients || []), { herbName: '', herbNameHi: '', latinName: '', qtyGrams: 0 }])
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Ingredient
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(formData.ingredients || []).map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                        <div>
                          <Label className="text-xs">Herb Name (EN)</Label>
                          <Input
                            value={ingredient.herbName}
                            onChange={(e) => {
                              const updated = [...(formData.ingredients || [])];
                              updated[index].herbName = e.target.value;
                              updateField('ingredients', updated);
                            }}
                            placeholder="Amla"
                          />
                        </div>
                        {/* UI-only Hindi herb name (submitted too) */}
                        <div>
                          <Label className="text-xs">Herb Name (HI)</Label>
                          <Input
                            value={ingredient.herbNameHi || ''}
                            onChange={(e) => {
                              const updated = [...(formData.ingredients || [])];
                              updated[index].herbNameHi = e.target.value;
                              updateField('ingredients', updated);
                            }}
                            placeholder="आंवला"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Latin Name</Label>
                          <Input
                            value={ingredient.latinName}
                            onChange={(e) => {
                              const updated = [...(formData.ingredients || [])];
                              updated[index].latinName = e.target.value;
                              updateField('ingredients', updated);
                            }}
                            placeholder="Phyllanthus emblica"
                          />
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                          <div>
                            <Label className="text-xs">Qty (grams)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={ingredient.qtyGrams}
                              onChange={(e) => {
                                const updated = [...(formData.ingredients || [])];
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
                                (formData.ingredients || []).filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
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
