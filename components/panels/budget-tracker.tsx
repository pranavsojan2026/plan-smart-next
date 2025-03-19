import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userSupabase } from '@/lib/supabase';
import { Plus, Save, DollarSign, Calendar, Pencil, Receipt } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { toast } from "sonner";

interface BudgetCategory {
  id: string;
  name: string;
  allocated_amount: number;
  spent_amount: number;
}

interface Expense {
  id: string;
  category_id: string;
  description: string;
  amount: number;
  date: string;
}

interface UserSettings {
  total_budget: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Add this constant for predefined categories
// Update the DEFAULT_CATEGORIES with percentages instead of fixed amounts
const DEFAULT_CATEGORIES = [
  { name: 'Venue', percentage: 35 },        // 35% of total budget
  { name: 'Catering', percentage: 25 },     // 25% of total budget
  { name: 'Entertainment', percentage: 15 }, // 15% of total budget
  { name: 'Decoration', percentage: 15 },    // 15% of total budget
  { name: 'Photography', percentage: 10 },   // 10% of total budget
];

export function BudgetTrackerPanel() {
  const [totalBudget, setTotalBudget] = useState(1500000);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category_id: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newTotalBudget, setNewTotalBudget] = useState(totalBudget);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  useEffect(() => {
    const channel = userSupabase
      .channel('budget-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_categories'
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchBudgetData();
        }
      )
      .subscribe();

    return () => {
      userSupabase.removeChannel(channel);
    };
  }, []);

  // Add this function to create default categories
  const createDefaultCategories = async (userId: string) => {
    try {
      const { data: existingCategories, error: fetchError } = await userSupabase
        .from('budget_categories')
        .select('name')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      // Only create categories that don't exist yet
      const missingCategories = DEFAULT_CATEGORIES.filter(
        cat => !existingCategories?.some(existing => existing.name === cat.name)
      );

      if (missingCategories.length > 0) {
        const { error: insertError } = await userSupabase
          .from('budget_categories')
          .insert(
            missingCategories.map(category => ({
              user_id: userId,
              name: category.name,
              allocated_amount: (totalBudget * category.percentage) / 100,
              spent_amount: 0
            }))
          );

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  };

  // Modify the fetchBudgetData function
  const fetchBudgetData = async () => {
    try {
      const { data: { user } } = await userSupabase.auth.getUser();
      if (!user) return;

      // Create default categories if they don't exist
      await createDefaultCategories(user.id);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await userSupabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true }); // Sort categories alphabetically

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await userSupabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    }
  };

  const handleAddExpense = async () => {
    try {
      const { data: { user } } = await userSupabase.auth.getUser();
      if (!user) return;

      const { error } = await userSupabase
        .from('expenses')
        .insert({
          user_id: user.id,
          ...newExpense
        });

      if (error) throw error;

      // Update category spent amount
      const category = categories.find(c => c.id === newExpense.category_id);
      if (category) {
        const { error: updateError } = await userSupabase
          .from('budget_categories')
          .update({
            spent_amount: category.spent_amount + newExpense.amount
          })
          .eq('id', category.id);

        if (updateError) throw updateError;
      }

      setIsAddExpenseOpen(false);
      setNewExpense({
        category_id: "",
        description: "",
        amount: 0,
        date: new Date().toISOString().split('T')[0]
      });
      fetchBudgetData();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleSaveBudget = async () => {
    try {
      const { data: { user } } = await userSupabase.auth.getUser();
      if (!user) return;

      // Show loading toast
      const loadingToast = toast.loading("Saving budget data...", {
        className: "font-aeonik"
      });

      // Update user settings with new total budget
      const { error: settingsError } = await userSupabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          total_budget: newTotalBudget
        }, {
          onConflict: 'user_id'
        });

      if (settingsError) throw settingsError;

      // Update all categories with new allocated amounts based on percentages
      const updatePromises = categories.map((category, index) => {
        const defaultCategory = DEFAULT_CATEGORIES.find(c => c.name === category.name);
        const allocatedAmount = defaultCategory 
          ? (newTotalBudget * defaultCategory.percentage) / 100
          : category.allocated_amount;

        return userSupabase
          .from('budget_categories')
          .update({
            allocated_amount: allocatedAmount,
            spent_amount: category.spent_amount
          })
          .eq('id', category.id);
      });

      await Promise.all(updatePromises);

      // Update local state
      setTotalBudget(newTotalBudget);
      setIsEditingBudget(false);

      // Show success toast
      toast.dismiss(loadingToast);
      toast.success("", {
        description: "All changes have been updated."
      });

    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error("Failed to save budget data", {
        description: "Please try again. If the problem persists, contact support."
      });
    }
  };

  const spentAmount = categories.reduce((sum, category) => sum + category.spent_amount, 0);
  const remainingBudget = totalBudget - spentAmount;

  const pieChartData = categories.map(category => ({
    name: category.name,
    value: category.spent_amount
  }));

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    
    try {
      const { data: { user } } = await userSupabase.auth.getUser();
      if (!user) return;

      // Get the old category and amount
      const oldExpense = expenses.find(e => e.id === editingExpense.id);
      const oldCategory = categories.find(c => c.id === oldExpense?.category_id);
      
      // Update the expense
      const { error: updateError } = await userSupabase
        .from('expenses')
        .update({
          category_id: editingExpense.category_id,
          description: editingExpense.description,
          amount: editingExpense.amount,
          date: editingExpense.date
        })
        .eq('id', editingExpense.id);

      if (updateError) throw updateError;

      // Update old category spent amount
      if (oldCategory) {
        await userSupabase
          .from('budget_categories')
          .update({
            spent_amount: oldCategory.spent_amount - (oldExpense?.amount || 0)
          })
          .eq('id', oldCategory.id);
      }

      // Update new category spent amount
      const newCategory = categories.find(c => c.id === editingExpense.category_id);
      if (newCategory) {
        await userSupabase
          .from('budget_categories')
          .update({
            spent_amount: newCategory.spent_amount + editingExpense.amount
          })
          .eq('id', newCategory.id);
      }

      setIsEditExpenseOpen(false);
      setEditingExpense(null);
      fetchBudgetData();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleResetBudget = async () => {
    try {
      const { data: { user } } = await userSupabase.auth.getUser();
      if (!user) return;

      const loadingToast = toast.loading("Resetting budget data...");

      // Reset all categories spent amounts to 0
      const resetCategoryPromises = categories.map(category =>
        userSupabase
          .from('budget_categories')
          .update({ spent_amount: 0 })
          .eq('id', category.id)
      );

      // Delete all expenses
      const { error: deleteError } = await userSupabase
        .from('expenses')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      await Promise.all(resetCategoryPromises);
      
      toast.dismiss(loadingToast);
      toast.success("Budget reset successfully");
      
      fetchBudgetData();
    } catch (error) {
      console.error('Error resetting budget:', error);
      toast.error("Failed to reset budget");
    }
  };

  return (
    <div className="space-y-6 font-aeonik">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground font-aeonik-medium">Budget Tracker</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleResetBudget}
            variant="outline"
            className="gap-2 font-aeonik text-red-500 hover:text-red-600"
          >
            Reset Amount
          </Button>
          <Button 
            onClick={handleSaveBudget} 
            className="gap-2 font-aeonik"
            variant="default"
          >
            <Save className="h-4 w-4" />
            Save Budget
          </Button>
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-aeonik">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="font-aeonik">
              <DialogHeader>
                <DialogTitle className="font-aeonik-medium">Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newExpense.category_id}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id}
                          className="font-aeonik"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{category.name}</span>
                            <span className="text-muted-foreground text-sm">
                              Available: ₹{(category.allocated_amount - category.spent_amount).toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newExpense.category_id && (
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const category = categories.find(c => c.id === newExpense.category_id);
                        if (category) {
                          const remaining = category.allocated_amount - category.spent_amount;
                          return `Budget Remaining: ₹${remaining.toLocaleString()}`;
                        }
                        return '';
                      })()}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Enter expense description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  Save Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold font-aeonik-medium">Total Budget</h3>
          </div>
          {isEditingBudget ? (
            <div className="flex gap-2">
              <Input
                type="number"
                value={newTotalBudget}
                onChange={(e) => setNewTotalBudget(Number(e.target.value))}
                className="text-2xl font-bold text-primary font-aeonik-medium"
              />
              <Button onClick={handleSaveBudget} size="sm">
                Save
              </Button>
              <Button 
                onClick={() => setIsEditingBudget(false)} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-primary font-aeonik-medium">
                ₹{totalBudget.toLocaleString()}
              </p>
              <Button 
                onClick={() => setIsEditingBudget(true)}
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold font-aeonik-medium">Spent Amount</h3>
          </div>
          <p className="text-3xl font-bold text-purple-500 font-aeonik-medium">₹{spentAmount.toLocaleString()}</p>
          <Progress value={(spentAmount / totalBudget) * 100} className="mt-2" />
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold font-aeonik-medium">Remaining Budget</h3>
          </div>
          <p className="text-3xl font-bold text-green-500 font-aeonik-medium">₹{remainingBudget.toLocaleString()}</p>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="font-aeonik">
          <TabsTrigger value="overview" className="font-aeonik">Budget Overview</TabsTrigger>
          <TabsTrigger value="categories" className="font-aeonik">Categories</TabsTrigger>
          <TabsTrigger value="expenses" className="font-aeonik">Expense List</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 font-aeonik-medium">Budget Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      value,
                      index
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = 25 + outerRadius;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          className="font-aeonik"
                          fill="#888"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                        >
                          {`${pieChartData[index].name} (₹${value.toLocaleString()})`}
                        </text>
                      );
                    }}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                    contentStyle={{ fontFamily: 'Aeonik' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 font-aeonik-medium">Budget vs. Actual Spending</h3>
            <div className="space-y-6">
              {categories.map((category) => {
                const percentage = (category.spent_amount / category.allocated_amount) * 100;
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between text-sm font-aeonik">
                      <span className="font-aeonik-medium">{category.name}</span>
                      <span>
                        ₹{category.spent_amount.toLocaleString()} / ₹{category.allocated_amount.toLocaleString()}
                        <span className="text-muted-foreground ml-2">
                          ({Math.round(percentage)}%)
                        </span>
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-3 ${percentage > 90 ? "bg-red-500" : percentage > 75 ? "bg-yellow-500" : "bg-green-500"}`}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Graph Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 font-aeonik-medium">Category Budget Analysis</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categories.map(category => ({
                    name: category.name,
                    allocated: category.allocated_amount,
                    spent: category.spent_amount,
                    remaining: category.allocated_amount - category.spent_amount
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fontFamily: 'Aeonik' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fontFamily: 'Aeonik' }}
                    tickFormatter={(value) => `₹${(value/1000)}K`}
                  />
                  <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                    contentStyle={{ fontFamily: 'Aeonik' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="allocated" 
                    name="Allocated Budget" 
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="spent" 
                    name="Spent Amount" 
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Billing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => {
              const categoryExpenses = expenses.filter(e => e.category_id === category.id);
              const remaining = category.allocated_amount - category.spent_amount;
              const percentage = (category.spent_amount / category.allocated_amount) * 100;
              
              return (
                <Card key={category.id} className="overflow-hidden">
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-aeonik-medium flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {category.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {categoryExpenses.length} transactions
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Receipt className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>

                    {/* Budget Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Usage</span>
                        <span className={percentage > 90 ? "text-red-500" : "text-muted-foreground"}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${percentage > 90 ? "bg-red-500" : percentage > 75 ? "bg-yellow-500" : "bg-green-500"}`}
                      />
                    </div>

                    {/* Amount Details */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Allocated</p>
                        <p className="font-aeonik-medium">₹{category.allocated_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spent</p>
                        <p className="font-aeonik-medium">₹{category.spent_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className={`font-aeonik-medium ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          ₹{remaining.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    {categoryExpenses.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-aeonik-medium mb-2">Recent Transactions</p>
                        <div className="space-y-2">
                          {categoryExpenses.slice(0, 3).map(expense => (
                            <div key={expense.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {new Date(expense.date).toLocaleDateString()}
                                </span>
                              </div>
                              <span className="font-aeonik-medium">
                                ₹{expense.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenses.map((expense) => {
              const category = categories.find(c => c.id === expense.category_id);
              return (
                <Card key={expense.id} className="overflow-hidden group">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-aeonik-medium text-lg">{category?.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{expense.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setEditingExpense(expense);
                          setIsEditExpenseOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-aeonik-medium text-lg">
                        ₹{expense.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div 
                    className="h-1"
                    style={{
                      background: COLORS[categories.findIndex(c => c.id === expense.category_id) % COLORS.length]
                    }}
                  />
                </Card>
              );
            })}
          </div>

          {/* Edit Expense Dialog */}
          <Dialog open={isEditExpenseOpen} onOpenChange={setIsEditExpenseOpen}>
            <DialogContent className="font-aeonik">
              <DialogHeader>
                <DialogTitle className="font-aeonik-medium">Edit Expense</DialogTitle>
              </DialogHeader>
              {editingExpense && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editingExpense.category_id}
                      onValueChange={(value) => 
                        setEditingExpense({ ...editingExpense, category_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            className="font-aeonik"
                          >
                            <div className="flex justify-between items-center w-full">
                              <span>{category.name}</span>
                              <span className="text-muted-foreground text-sm">
                                Available: ₹{(category.allocated_amount - category.spent_amount).toLocaleString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={editingExpense.description}
                      onChange={(e) => 
                        setEditingExpense({ ...editingExpense, description: e.target.value })
                      }
                      placeholder="Enter expense description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={editingExpense.amount}
                      onChange={(e) => 
                        setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })
                      }
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={editingExpense.date}
                      onChange={(e) => 
                        setEditingExpense({ ...editingExpense, date: e.target.value })
                      }
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditExpenseOpen(false);
                        setEditingExpense(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateExpense}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}