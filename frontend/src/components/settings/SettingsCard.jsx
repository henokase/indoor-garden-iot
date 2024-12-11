const SettingsCard = ({title, icon, label, unit, value, onValueChange }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800">
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <h2 className="text-lg font-medium">{title}</h2>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-500 mb-1">
                        {`${label} (${unit})`}
                    </label>
                    <input
                        type="range"
                        name="moistureThreshold"
                        min="0"
                        max="100"
                        value={value}
                        onChange={onValueChange}
                        className="w-full"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                        {`${value} ${unit}`}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsCard;
